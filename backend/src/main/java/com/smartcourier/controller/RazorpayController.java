package com.smartcourier.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.Order;
import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.User;
import com.smartcourier.repository.ParcelRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.RazorpayService;

@RestController
@RequestMapping("/api/razorpay")
@CrossOrigin(origins = "http://localhost:5173")
public class RazorpayController {

	private final RazorpayService razorpayService;
	private final UserRepository userRepository;
	private final ParcelRepository parcelRepository;

	public RazorpayController(RazorpayService razorpayService, UserRepository userRepository,
			ParcelRepository parcelRepository) {

		this.razorpayService = razorpayService;
		this.userRepository = userRepository;
		this.parcelRepository = parcelRepository;
	}

	@PostMapping("/create-order")
	public ResponseEntity<?> createOrder(@RequestParam double amount, @RequestParam Long parcelId,
			Authentication authentication) {

		try {

			// =========================================
			// 1. CHECK LOGIN
			// =========================================

			if (authentication == null || !authentication.isAuthenticated()) {

				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("success", false, "message", "Please login first."));
			}

			// =========================================
			// 2. GET LOGGED-IN USER
			// =========================================

			String email = authentication.getName();

			User user = userRepository.findByEmail(email);

			if (user == null) {

				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("success", false, "message", "User account not found."));
			}

			String role = user.getRole() == null ? "" : user.getRole().trim().toUpperCase();

			// =========================================
			// 3. FIND PARCEL
			// =========================================

			Parcel parcel = parcelRepository.findById(parcelId).orElse(null);

			if (parcel == null) {

				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(Map.of("success", false, "message", "Parcel not found."));
			}

			// =========================================
			// 4. CUSTOMER OWNERSHIP CHECK
			// =========================================

			if (role.equals("CUSTOMER") && !user.getId().equals(parcel.getUserId())) {

				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("success", false, "message", "You can create payment only for your own parcel."));
			}

			// =========================================
			// 5. VALIDATE AMOUNT
			// =========================================

			double actualAmount = parcel.getDeliveryCharge();

			if (actualAmount <= 0) {

				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "message", "Parcel delivery charge is invalid."));
			}

			/*
			 * Do not trust the amount sent by React.
			 *
			 * Compare it with the amount stored in the database for this parcel.
			 */
			if (Math.abs(amount - actualAmount) > 0.01) {

				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "message", "Payment amount does not match the parcel charge.",
								"expectedAmount", actualAmount, "receivedAmount", amount));
			}

			// =========================================
			// 6. CREATE RAZORPAY ORDER
			// =========================================

			String receipt = "PARCEL_" + parcel.getId();

			Order order = razorpayService.createOrder(actualAmount, receipt);

			// =========================================
			// 7. SEND ORDER DETAILS TO FRONTEND
			// =========================================

			Map<String, Object> response = new LinkedHashMap<>();

			response.put("success", true);
			response.put("orderId", order.get("id"));
			response.put("amount", order.get("amount"));
			response.put("currency", order.get("currency"));
			response.put("receipt", order.get("receipt"));
			response.put("parcelId", parcel.getId());
			response.put("trackingId", parcel.getTrackingId());

			return ResponseEntity.ok(response);

		} catch (Exception e) {

			e.printStackTrace();

			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(Map.of("success", false, "error", "Unable to create Razorpay order.", "message",
							e.getMessage() != null ? e.getMessage() : "Unknown Razorpay error."));
		}
	}
}