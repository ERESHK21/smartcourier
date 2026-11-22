package com.smartcourier.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.Complaint;
import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.User;
import com.smartcourier.repository.ParcelRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.ComplaintService;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

	private final ComplaintService complaintService;
	private final UserRepository userRepository;
	private final ParcelRepository parcelRepository;

	public ComplaintController(ComplaintService complaintService, UserRepository userRepository,
			ParcelRepository parcelRepository) {

		this.complaintService = complaintService;
		this.userRepository = userRepository;
		this.parcelRepository = parcelRepository;
	}

	// =====================================================
	// CREATE COMPLAINT
	// =====================================================

	@PostMapping
	public ResponseEntity<Complaint> createComplaint(@RequestBody Complaint complaint, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		if (role.equals("CUSTOMER")) {

			complaint.setUserId(user.getId());

			if (complaint.getParcelId() != null) {

				Parcel parcel = parcelRepository.findById(complaint.getParcelId()).orElse(null);

				if (parcel == null) {
					return ResponseEntity.notFound().build();
				}

				if (!user.getId().equals(parcel.getUserId())) {
					return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
				}
			}
		}

		return ResponseEntity.ok(complaintService.createComplaint(complaint));
	}

	// =====================================================
	// GET ALL COMPLAINTS
	// =====================================================

	@GetMapping
	public ResponseEntity<List<Complaint>> getAllComplaints(Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		if (role.equals("CUSTOMER")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(complaintService.getAllComplaints());
	}

	// =====================================================
	// GET COMPLAINT BY ID
	// =====================================================

	@GetMapping("/{id}")
	public ResponseEntity<Complaint> getComplaintById(@PathVariable Long id, Authentication authentication) {

		Complaint complaint = complaintService.getComplaintById(id).orElse(null);

		if (complaint == null) {
			return ResponseEntity.notFound().build();
		}

		if (!customerCanAccessComplaint(complaint, authentication)) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(complaint);
	}

	// =====================================================
	// GET COMPLAINTS BY USER
	// =====================================================

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Complaint>> getComplaintsByUserId(@PathVariable Long userId,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		if (role.equals("CUSTOMER") && !user.getId().equals(userId)) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(complaintService.getComplaintsByUserId(userId));
	}

	// =====================================================
	// GET COMPLAINTS BY PARCEL
	// =====================================================

	@GetMapping("/parcel/{parcelId}")
	public ResponseEntity<List<Complaint>> getComplaintsByParcelId(@PathVariable Long parcelId,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		if (role.equals("CUSTOMER")) {

			Parcel parcel = parcelRepository.findById(parcelId).orElse(null);

			if (parcel == null) {
				return ResponseEntity.notFound().build();
			}

			if (!user.getId().equals(parcel.getUserId())) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
			}
		}

		return ResponseEntity.ok(complaintService.getComplaintsByParcelId(parcelId));
	}

	// =====================================================
	// GET COMPLAINTS BY STATUS
	// =====================================================

	@GetMapping("/status/{status}")
	public ResponseEntity<List<Complaint>> getComplaintsByStatus(@PathVariable String status,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		if (role.equals("CUSTOMER")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(complaintService.getComplaintsByStatus(status));
	}

	// =====================================================
	// UPDATE COMPLAINT STATUS
	// =====================================================

	@PutMapping("/{id}/status")
	public ResponseEntity<Complaint> updateStatus(@PathVariable Long id, @RequestParam(required = false) String status,
			@RequestBody(required = false) Map<String, Object> body, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		// Only MANAGER and ADMIN can update complaint status
		if (!role.equals("MANAGER") && !role.equals("ADMIN")) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		/*
		 * Accept status from either:
		 *
		 * 1. Query parameter: ?status=RESOLVED
		 *
		 * 2. JSON body: {"status":"RESOLVED"}
		 */

		if (status == null || status.trim().isEmpty()) {

			if (body != null && body.get("status") != null) {
				status = body.get("status").toString();
			}
		}

		if (status == null || status.trim().isEmpty()) {

			return ResponseEntity.badRequest().build();
		}

		status = status.trim().toUpperCase();

		// Allow only valid complaint statuses
		if (!status.equals("OPEN") && !status.equals("IN_PROGRESS") && !status.equals("RESOLVED")
				&& !status.equals("CLOSED")) {

			return ResponseEntity.badRequest().build();
		}

		Complaint complaint = complaintService.updateStatus(id, status);

		if (complaint == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(complaint);
	}

	// =====================================================
	// GET LOGGED-IN USER
	// =====================================================

	private User getLoggedInUser(Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {

			return null;
		}

		String email = authentication.getName();

		return userRepository.findByEmail(email);
	}

	// =====================================================
	// GET USER ROLE
	// =====================================================

	private String getRole(User user) {

		if (user.getRole() == null) {
			return "";
		}

		return user.getRole().trim().toUpperCase();
	}

	// =====================================================
	// CHECK COMPLAINT OWNERSHIP
	// =====================================================

	private boolean customerCanAccessComplaint(Complaint complaint, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return false;
		}

		String role = getRole(user);

		// MANAGER and ADMIN can access all complaints
		if (role.equals("MANAGER") || role.equals("ADMIN")) {

			return true;
		}

		// CUSTOMER can access only their own complaint
		return user.getId().equals(complaint.getUserId());
	}
}