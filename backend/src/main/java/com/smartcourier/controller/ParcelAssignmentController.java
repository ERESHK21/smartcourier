package com.smartcourier.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.DeliveryAgent;
import com.smartcourier.entity.ParcelAssignment;
import com.smartcourier.entity.User;
import com.smartcourier.repository.DeliveryAgentRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.ParcelAssignmentService;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "http://localhost:5173")
public class ParcelAssignmentController {

	private final ParcelAssignmentService assignmentService;
	private final UserRepository userRepository;
	private final DeliveryAgentRepository deliveryAgentRepository;

	public ParcelAssignmentController(ParcelAssignmentService assignmentService, UserRepository userRepository,
			DeliveryAgentRepository deliveryAgentRepository) {

		this.assignmentService = assignmentService;
		this.userRepository = userRepository;
		this.deliveryAgentRepository = deliveryAgentRepository;
	}

	// Assign parcel to delivery agent
	// Only MANAGER and ADMIN
	@PostMapping
	public ResponseEntity<ParcelAssignment> assignParcel(@RequestParam Long parcelId,
			@RequestParam Long deliveryAgentId, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		if (!role.equals("MANAGER") && !role.equals("ADMIN")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(assignmentService.assignParcel(parcelId, deliveryAgentId));
	}

	// Get all assignments
	// Only MANAGER and ADMIN
	@GetMapping
	public ResponseEntity<List<ParcelAssignment>> getAllAssignments(Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		if (!role.equals("MANAGER") && !role.equals("ADMIN")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(assignmentService.getAllAssignments());
	}

	// Get assignment by ID
	@GetMapping("/{id}")
	public ResponseEntity<ParcelAssignment> getAssignmentById(@PathVariable Long id, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		ParcelAssignment assignment = assignmentService.getAssignmentById(id);

		if (assignment == null) {
			return ResponseEntity.notFound().build();
		}

		String role = user.getRole().trim().toUpperCase();

		// Manager/Admin can access any assignment
		if (role.equals("MANAGER") || role.equals("ADMIN")) {
			return ResponseEntity.ok(assignment);
		}

		// Delivery agent can access only their own assignment
		if (role.equals("DELIVERY_AGENT") && isOwnAssignment(assignment, user.getId())) {

			return ResponseEntity.ok(assignment);
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

	// Get assignments by parcel
	@GetMapping("/parcel/{parcelId}")
	public ResponseEntity<List<ParcelAssignment>> getByParcel(@PathVariable Long parcelId,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		// Only Manager/Admin can view assignments by parcel
		if (role.equals("MANAGER") || role.equals("ADMIN")) {
			return ResponseEntity.ok(assignmentService.getAssignmentsByParcelId(parcelId));
		}

		// Delivery agent can view the parcel only if
		// the parcel is assigned to that agent
		if (role.equals("DELIVERY_AGENT")) {

			DeliveryAgent agent = deliveryAgentRepository.findByUserId(user.getId()).orElse(null);

			if (agent == null) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
			}

			List<ParcelAssignment> assignments = assignmentService.getAssignmentsByParcelId(parcelId);

			boolean ownsAssignment = assignments.stream().anyMatch(a -> agent.getId().equals(a.getDeliveryAgentId()));

			if (!ownsAssignment) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
			}

			return ResponseEntity.ok(assignments);
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

	// Get assignments by delivery agent
	@GetMapping("/agent/{deliveryAgentId}")
	public ResponseEntity<List<ParcelAssignment>> getByAgent(@PathVariable Long deliveryAgentId,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		// Manager/Admin can view any agent's assignments
		if (role.equals("MANAGER") || role.equals("ADMIN")) {
			return ResponseEntity.ok(assignmentService.getAssignmentsByAgentId(deliveryAgentId));
		}

		// Delivery agent can view only their own assignments
		if (role.equals("DELIVERY_AGENT")) {

			DeliveryAgent agent = deliveryAgentRepository.findByUserId(user.getId()).orElse(null);

			if (agent == null || !agent.getId().equals(deliveryAgentId)) {

				return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
			}

			return ResponseEntity.ok(assignmentService.getAssignmentsByAgentId(deliveryAgentId));
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

	// Get assignments by status
	@GetMapping("/status/{status}")
	public ResponseEntity<List<ParcelAssignment>> getByStatus(@PathVariable String status,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		// Only Manager/Admin can see all assignments by status
		if (!role.equals("MANAGER") && !role.equals("ADMIN")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(assignmentService.getAssignmentsByStatus(status));
	}

	// Accept assignment
	@PutMapping("/{id}/accept")
	public ResponseEntity<ParcelAssignment> acceptAssignment(@PathVariable Long id, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		ParcelAssignment assignment = assignmentService.getAssignmentById(id);

		if (assignment == null) {
			return ResponseEntity.notFound().build();
		}

		// Manager/Admin can manage assignment
		if (role.equals("MANAGER") || role.equals("ADMIN")) {
			return ResponseEntity.ok(assignmentService.acceptAssignment(id));
		}

		// Delivery agent can accept only their own assignment
		if (role.equals("DELIVERY_AGENT") && isOwnAssignment(assignment, user.getId())) {

			return ResponseEntity.ok(assignmentService.acceptAssignment(id));
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

	// Complete assignment
	@PutMapping("/{id}/complete")
	public ResponseEntity<ParcelAssignment> completeAssignment(@PathVariable Long id, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		ParcelAssignment assignment = assignmentService.getAssignmentById(id);

		if (assignment == null) {
			return ResponseEntity.notFound().build();
		}

		// Manager/Admin can complete assignment
		if (role.equals("MANAGER") || role.equals("ADMIN")) {
			return ResponseEntity.ok(assignmentService.completeAssignment(id));
		}

		// Delivery agent can complete only their own assignment
		if (role.equals("DELIVERY_AGENT") && isOwnAssignment(assignment, user.getId())) {

			return ResponseEntity.ok(assignmentService.completeAssignment(id));
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

	// Check whether assignment belongs to logged-in delivery agent
	private boolean isOwnAssignment(ParcelAssignment assignment, Long userId) {

		DeliveryAgent agent = deliveryAgentRepository.findByUserId(userId).orElse(null);

		if (agent == null) {
			return false;
		}

		return agent.getId().equals(assignment.getDeliveryAgentId());
	}

	// Get logged-in user
	private User getLoggedInUser(Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {

			return null;
		}

		String email = authentication.getName();

		return userRepository.findByEmail(email);
	}
}