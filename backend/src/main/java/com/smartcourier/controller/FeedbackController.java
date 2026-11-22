package com.smartcourier.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.Feedback;
import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.User;
import com.smartcourier.repository.ParcelRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.FeedbackService;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedbackController {

	private final FeedbackService feedbackService;
	private final UserRepository userRepository;
	private final ParcelRepository parcelRepository;

	public FeedbackController(FeedbackService feedbackService, UserRepository userRepository,
			ParcelRepository parcelRepository) {

		this.feedbackService = feedbackService;
		this.userRepository = userRepository;
		this.parcelRepository = parcelRepository;
	}

	// =====================================================
	// CREATE FEEDBACK
	// =====================================================

	@PostMapping
	public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		/*
		 * IMPORTANT: Never trust userId sent by the frontend. Always use the
		 * authenticated user's ID.
		 */
		if (role.equals("CUSTOMER")) {

			feedback.setUserId(user.getId());

			/*
			 * Customer can give feedback only for their own parcel.
			 */
			if (feedback.getParcelId() != null) {

				Parcel parcel = parcelRepository.findById(feedback.getParcelId()).orElse(null);

				if (parcel == null) {
					return ResponseEntity.notFound().build();
				}

				if (!user.getId().equals(parcel.getUserId())) {

					return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
				}
			}
		}

		return ResponseEntity.ok(feedbackService.createFeedback(feedback));
	}

	// =====================================================
	// GET ALL FEEDBACK
	// =====================================================

	@GetMapping
	public ResponseEntity<List<Feedback>> getAllFeedback(Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		// CUSTOMER cannot see all users' feedback
		if (role.equals("CUSTOMER")) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(feedbackService.getAllFeedback());
	}

	// =====================================================
	// GET FEEDBACK BY ID
	// =====================================================

	@GetMapping("/{id}")
	public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id, Authentication authentication) {

		Feedback feedback = feedbackService.getFeedbackById(id).orElse(null);

		if (feedback == null) {
			return ResponseEntity.notFound().build();
		}

		if (!customerCanAccessFeedback(feedback, authentication)) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(feedback);
	}

	// =====================================================
	// GET FEEDBACK BY USER
	// =====================================================

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Feedback>> getFeedbackByUserId(@PathVariable Long userId,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		// CUSTOMER can see only their own feedback
		if (role.equals("CUSTOMER") && !user.getId().equals(userId)) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(feedbackService.getFeedbackByUserId(userId));
	}

	// =====================================================
	// GET FEEDBACK BY PARCEL
	// =====================================================

	@GetMapping("/parcel/{parcelId}")
	public ResponseEntity<List<Feedback>> getFeedbackByParcelId(@PathVariable Long parcelId,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		// CUSTOMER can see feedback only for their own parcel
		if (role.equals("CUSTOMER")) {

			Parcel parcel = parcelRepository.findById(parcelId).orElse(null);

			if (parcel == null) {
				return ResponseEntity.notFound().build();
			}

			if (!user.getId().equals(parcel.getUserId())) {

				return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
			}
		}

		return ResponseEntity.ok(feedbackService.getFeedbackByParcelId(parcelId));
	}

	// =====================================================
	// GET FEEDBACK BY RATING
	// =====================================================

	@GetMapping("/rating/{rating}")
	public ResponseEntity<List<Feedback>> getFeedbackByRating(@PathVariable Integer rating,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		// CUSTOMER cannot see global feedback
		if (role.equals("CUSTOMER")) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(feedbackService.getFeedbackByRating(rating));
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
	// CHECK FEEDBACK OWNERSHIP
	// =====================================================

	private boolean customerCanAccessFeedback(Feedback feedback, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return false;
		}

		String role = getRole(user);

		// MANAGER and ADMIN can access feedback
		if (role.equals("MANAGER") || role.equals("ADMIN")) {

			return true;
		}

		// CUSTOMER can access only their own feedback
		return user.getId().equals(feedback.getUserId());
	}
}