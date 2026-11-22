package com.smartcourier.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.User;
import com.smartcourier.repository.ParcelRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.DeliveryPredictionService;

@RestController
@RequestMapping("/api/prediction")
@CrossOrigin(origins = "http://localhost:5173")
public class DeliveryPredictionController {

	private final DeliveryPredictionService predictionService;
	private final ParcelRepository parcelRepository;
	private final UserRepository userRepository;

	public DeliveryPredictionController(DeliveryPredictionService predictionService, ParcelRepository parcelRepository,
			UserRepository userRepository) {

		this.predictionService = predictionService;
		this.parcelRepository = parcelRepository;
		this.userRepository = userRepository;
	}

	// =====================================================
	// DIRECT PREDICTION
	// =====================================================

	@PostMapping("/delivery")
	public ResponseEntity<?> predictDelivery(@RequestBody Map<String, Object> request, Authentication authentication) {

		try {

			User user = getLoggedInUser(authentication);

			if (user == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("success", false, "message", "User is not authenticated"));
			}

			double weight = Double.parseDouble(request.get("weight").toString());

			double distance = Double.parseDouble(request.get("distance").toString());

			String deliveryType = request.get("deliveryType").toString();

			double hubDelay = Double.parseDouble(request.get("hubDelay").toString());

			double predictedDays = predictionService.predictDeliveryDays(weight, distance, deliveryType, hubDelay);

			return ResponseEntity.ok(Map.of("predictedDeliveryDays", Math.round(predictedDays)));

		} catch (Exception e) {

			return ResponseEntity.badRequest()
					.body(Map.of("error", "Unable to predict delivery time", "message", e.getMessage()));
		}
	}

	// =====================================================
	// PREDICTION USING PARCEL ID
	// =====================================================

	@PostMapping("/parcel/{parcelId}")
	public ResponseEntity<?> predictParcelDelivery(@PathVariable Long parcelId,
			@RequestBody Map<String, Object> request, Authentication authentication) {

		try {

			User user = getLoggedInUser(authentication);

			if (user == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("success", false, "message", "User is not authenticated"));
			}

			Optional<Parcel> optionalParcel = parcelRepository.findById(parcelId);

			if (optionalParcel.isEmpty()) {

				return ResponseEntity.notFound().build();
			}

			Parcel parcel = optionalParcel.get();

			String role = getRole(user);

			/*
			 * CUSTOMER can predict only their own parcel.
			 *
			 * MANAGER and ADMIN can access any parcel.
			 */
			if (role.equals("CUSTOMER") && !user.getId().equals(parcel.getUserId())) {

				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("success", false, "message", "You are not authorized to access this parcel"));
			}

			double distance = Double.parseDouble(request.get("distance").toString());

			double hubDelay = Double.parseDouble(request.get("hubDelay").toString());

			double predictedDays = predictionService.predictDeliveryDays(parcel.getWeight(), distance,
					parcel.getDeliveryType(), hubDelay);

			return ResponseEntity.ok(Map.of("parcelId", parcel.getId(),

					"trackingId", parcel.getTrackingId(),

					"deliveryType", parcel.getDeliveryType(),

					"predictedDeliveryDays", Math.round(predictedDays)));

		} catch (Exception e) {

			return ResponseEntity.badRequest()
					.body(Map.of("error", "Unable to predict parcel delivery time", "message", e.getMessage()));
		}
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
}