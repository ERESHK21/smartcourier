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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.User;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.ParcelService;

@RestController
@RequestMapping("/api/parcels")
@CrossOrigin(origins = "http://localhost:5173")
public class ParcelController {

	private final ParcelService parcelService;
	private final UserRepository userRepository;

	public ParcelController(ParcelService parcelService, UserRepository userRepository) {
		this.parcelService = parcelService;
		this.userRepository = userRepository;
	}

	@PostMapping
	public ResponseEntity<Parcel> createParcel(@RequestBody Parcel parcel, @RequestParam Long userId,
			Authentication authentication) {

		String email = authentication.getName();
		User user = userRepository.findByEmail(email);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		// CUSTOMER can create a parcel only for their own account
		if (role.equals("CUSTOMER") && !user.getId().equals(userId)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(parcelService.createParcel(parcel, userId));
	}

	@GetMapping
	public ResponseEntity<List<Parcel>> getAllParcels(Authentication authentication) {

		String email = authentication.getName();
		User user = userRepository.findByEmail(email);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		// Only staff roles can see all parcels
		if (role.equals("CUSTOMER")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(parcelService.getAllParcels());
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Parcel>> getParcelsByUserId(@PathVariable Long userId, Authentication authentication) {

		String email = authentication.getName();
		User user = userRepository.findByEmail(email);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		// CUSTOMER can see only their own parcels
		if (role.equals("CUSTOMER") && !user.getId().equals(userId)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(parcelService.getParcelsByUserId(userId));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Parcel> getParcelById(@PathVariable Long id, Authentication authentication) {

		Parcel parcel = parcelService.getParcelById(id);

		if (parcel == null) {
			return ResponseEntity.notFound().build();
		}

		String email = authentication.getName();
		User user = userRepository.findByEmail(email);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		// CUSTOMER can see only their own parcel
		if (role.equals("CUSTOMER") && !user.getId().equals(parcel.getUserId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(parcel);
	}

	@GetMapping("/tracking/{trackingId}")
	public ResponseEntity<Parcel> getParcelByTrackingId(@PathVariable String trackingId,
			Authentication authentication) {

		Parcel parcel = parcelService.getParcelByTrackingId(trackingId);

		if (parcel == null) {
			return ResponseEntity.notFound().build();
		}

		String email = authentication.getName();
		User user = userRepository.findByEmail(email);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		// CUSTOMER can track only their own parcel
		if (role.equals("CUSTOMER") && !user.getId().equals(parcel.getUserId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(parcel);
	}

	@PutMapping("/{id}/status")
	public ResponseEntity<Parcel> updateStatus(@PathVariable Long id, @RequestParam String status,
			Authentication authentication) {

		Parcel parcel = parcelService.getParcelById(id);

		if (parcel == null) {
			return ResponseEntity.notFound().build();
		}

		String email = authentication.getName();
		User user = userRepository.findByEmail(email);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		// CUSTOMER cannot change parcel status
		if (role.equals("CUSTOMER")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		Parcel updatedParcel = parcelService.updateStatus(id, status);

		return ResponseEntity.ok(updatedParcel);
	}
}