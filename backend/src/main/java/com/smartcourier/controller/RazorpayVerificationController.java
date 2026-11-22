package com.smartcourier.controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.smartcourier.dto.RazorpayVerificationRequest;
import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.Payment;
import com.smartcourier.entity.User;
import com.smartcourier.repository.ParcelRepository;
import com.smartcourier.repository.PaymentRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.RazorpayService;

@RestController
@RequestMapping("/api/razorpay")
@CrossOrigin(origins = "http://localhost:5173")
public class RazorpayVerificationController {

	private final RazorpayService razorpayService;
	private final RazorpayClient razorpayClient;
	private final UserRepository userRepository;
	private final ParcelRepository parcelRepository;
	private final PaymentRepository paymentRepository;

	public RazorpayVerificationController(RazorpayService razorpayService, RazorpayClient razorpayClient,
			UserRepository userRepository, ParcelRepository parcelRepository, PaymentRepository paymentRepository) {

		this.razorpayService = razorpayService;
		this.razorpayClient = razorpayClient;
		this.userRepository = userRepository;
		this.parcelRepository = parcelRepository;
		this.paymentRepository = paymentRepository;
	}

	@PostMapping("/verify-payment")
	public ResponseEntity<?> verifyPayment(@RequestBody RazorpayVerificationRequest request,
			Authentication authentication) {

		try {

			// =====================================================
			// 1. CHECK LOGIN
			// =====================================================

			if (authentication == null || !authentication.isAuthenticated()) {

				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("success", false, "message", "User is not authenticated"));
			}

			// =====================================================
			// 2. GET LOGGED-IN USER
			// =====================================================

			String email = authentication.getName();

			User user = userRepository.findByEmail(email);

			if (user == null) {

				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("success", false, "message", "User not found"));
			}

			// =====================================================
			// 3. VALIDATE REQUEST
			// =====================================================

			if (request.getParcelId() == null) {

				return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Parcel ID is required"));
			}

			if (request.getRazorpayOrderId() == null || request.getRazorpayOrderId().isBlank()) {

				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "message", "Razorpay Order ID is required"));
			}

			if (request.getRazorpayPaymentId() == null || request.getRazorpayPaymentId().isBlank()) {

				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "message", "Razorpay Payment ID is required"));
			}

			if (request.getRazorpaySignature() == null || request.getRazorpaySignature().isBlank()) {

				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "message", "Razorpay Signature is required"));
			}

			// =====================================================
			// 4. FIND PARCEL
			// =====================================================

			Parcel parcel = parcelRepository.findById(request.getParcelId()).orElse(null);

			if (parcel == null) {

				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(Map.of("success", false, "message", "Parcel not found"));
			}

			// =====================================================
			// 5. CUSTOMER OWNERSHIP CHECK
			// =====================================================

			String role = user.getRole() == null ? "" : user.getRole().trim().toUpperCase();

			if ("CUSTOMER".equals(role) && !user.getId().equals(parcel.getUserId())) {

				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("success", false, "message", "You are not authorized to pay for this parcel"));
			}

			// =====================================================
			// 6. CHECK ALREADY PAID
			// =====================================================

			if ("PAID".equalsIgnoreCase(parcel.getPaymentStatus())) {

				return ResponseEntity.status(HttpStatus.CONFLICT)
						.body(Map.of("success", false, "message", "This parcel is already paid."));
			}

			// =====================================================
			// 7. CHECK DUPLICATE PAYMENT
			// =====================================================

			var existingPayment = paymentRepository.findByTransactionId(request.getRazorpayPaymentId());

			if (existingPayment.isPresent()) {

				Payment payment = existingPayment.get();

				if (!payment.getParcelId().equals(parcel.getId()) || !payment.getUserId().equals(user.getId())) {

					return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("success", false, "message",
							"This Razorpay payment is already associated with another transaction."));
				}

				Map<String, Object> response = new LinkedHashMap<>();

				response.put("success", true);
				response.put("message", "Payment was already verified");
				response.put("paymentId", payment.getId());
				response.put("parcelId", payment.getParcelId());
				response.put("trackingId", parcel.getTrackingId());
				response.put("amount", payment.getAmount());
				response.put("paymentStatus", payment.getPaymentStatus());
				response.put("paymentMethod", payment.getPaymentMethod());
				response.put("transactionId", payment.getTransactionId());
				response.put("razorpayOrderId", payment.getRazorpayOrderId());
				response.put("razorpayPaymentId", payment.getRazorpayPaymentId());

				return ResponseEntity.ok(response);
			}

			// =====================================================
			// 8. FETCH RAZORPAY ORDER
			// =====================================================

			Order razorpayOrder = razorpayClient.orders.fetch(request.getRazorpayOrderId());

			// =====================================================
			// 9. CHECK AMOUNT
			// =====================================================

			Object amountObject = razorpayOrder.get("amount");

			int razorpayAmount = ((Number) amountObject).intValue();

			int expectedAmount = (int) Math.round(parcel.getDeliveryCharge() * 100);

			if (razorpayAmount != expectedAmount) {

				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "message", "Razorpay amount does not match parcel charge.",
								"expectedAmount", expectedAmount, "razorpayAmount", razorpayAmount));
			}

			// =====================================================
			// 10. CHECK RECEIPT
			// =====================================================

			String expectedReceipt = "PARCEL_" + parcel.getId();

			/*
			 * IMPORTANT: Store the Razorpay value as Object first. This prevents Java from
			 * trying to cast String to char[] because of String.valueOf overloads.
			 */
			Object receiptObject = razorpayOrder.get("receipt");

			String actualReceipt = receiptObject == null ? "" : receiptObject.toString();

			if (!expectedReceipt.equals(actualReceipt)) {

				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "message", "Razorpay order does not belong to this parcel."));
			}

			// =====================================================
			// 11. VERIFY SIGNATURE
			// =====================================================

			boolean verified = razorpayService.verifyPayment(request.getRazorpayOrderId(),
					request.getRazorpayPaymentId(), request.getRazorpaySignature());

			if (!verified) {

				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "message", "Razorpay payment verification failed"));
			}

			// =====================================================
			// 12. CREATE PAYMENT RECORD
			// =====================================================

			Payment payment = new Payment();

			payment.setParcelId(parcel.getId());
			payment.setUserId(user.getId());
			payment.setAmount(parcel.getDeliveryCharge());
			payment.setPaymentMethod("RAZORPAY");
			payment.setPaymentStatus("SUCCESS");

			payment.setTransactionId(request.getRazorpayPaymentId());

			payment.setPaymentDate(LocalDateTime.now());

			payment.setRazorpayOrderId(request.getRazorpayOrderId());

			payment.setRazorpayPaymentId(request.getRazorpayPaymentId());

			payment.setRazorpaySignature(request.getRazorpaySignature());

			// =====================================================
			// 13. SAVE PAYMENT
			// =====================================================

			Payment savedPayment = paymentRepository.save(payment);

			// =====================================================
			// 14. UPDATE PAYMENT STATUS ONLY
			// =====================================================

			parcel.setPaymentStatus("PAID");

			parcelRepository.save(parcel);

			// =====================================================
			// 15. RESPONSE
			// =====================================================

			Map<String, Object> response = new LinkedHashMap<>();

			response.put("success", true);

			response.put("message", "Payment verified and saved successfully");

			response.put("paymentId", savedPayment.getId());

			response.put("parcelId", savedPayment.getParcelId());

			response.put("trackingId", parcel.getTrackingId());

			response.put("amount", savedPayment.getAmount());

			response.put("paymentStatus", savedPayment.getPaymentStatus());

			response.put("parcelPaymentStatus", parcel.getPaymentStatus());

			response.put("parcelStatus", parcel.getStatus());

			response.put("paymentMethod", savedPayment.getPaymentMethod());

			response.put("transactionId", savedPayment.getTransactionId());

			response.put("razorpayOrderId", savedPayment.getRazorpayOrderId());

			response.put("razorpayPaymentId", savedPayment.getRazorpayPaymentId());

			return ResponseEntity.ok(response);

		} catch (Exception e) {

			e.printStackTrace();

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "message", "Payment verification failed", "error",
							e.getMessage() != null ? e.getMessage() : "Unknown server error"));
		}
	}
}