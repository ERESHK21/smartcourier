package com.smartcourier.controller;

import java.util.List;
import java.util.stream.Collectors;

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

import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.Payment;
import com.smartcourier.entity.User;
import com.smartcourier.repository.ParcelRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

	private final PaymentService paymentService;
	private final UserRepository userRepository;
	private final ParcelRepository parcelRepository;

	public PaymentController(PaymentService paymentService, UserRepository userRepository,
			ParcelRepository parcelRepository) {

		this.paymentService = paymentService;
		this.userRepository = userRepository;
		this.parcelRepository = parcelRepository;
	}

	/*
	 * Legacy payment endpoint.
	 *
	 * Razorpay payments should use: POST /api/razorpay/create-order POST
	 * /api/razorpay/verify-payment
	 *
	 * This endpoint remains available for compatibility, but PaymentService now
	 * stores the payment as PENDING.
	 */
	@PostMapping
	public ResponseEntity<Payment> createPayment(@RequestBody Payment payment, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		if (payment == null || payment.getParcelId() == null) {
			return ResponseEntity.badRequest().build();
		}

		String role = getRole(user);

		Parcel parcel = parcelRepository.findById(payment.getParcelId()).orElse(null);

		if (parcel == null) {
			return ResponseEntity.notFound().build();
		}

		/*
		 * CUSTOMER must own the parcel.
		 */
		if (role.equals("CUSTOMER") && !user.getId().equals(parcel.getUserId())) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		/*
		 * Never trust userId sent by the frontend. Always use the authenticated user's
		 * ID.
		 */
		payment.setUserId(user.getId());

		/*
		 * Use the parcel's actual delivery charge. Do not trust an amount supplied by
		 * the frontend.
		 */
		payment.setParcelId(parcel.getId());
		payment.setAmount(parcel.getDeliveryCharge());

		return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(payment));
	}

	/*
	 * CUSTOMER: Only their own payments.
	 *
	 * ADMIN: All payments.
	 */
	@GetMapping
	public ResponseEntity<List<Payment>> getAllPayments(Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		if (role.equals("CUSTOMER")) {

			List<Payment> payments = paymentService.getPaymentsByUserId(user.getId());

			return ResponseEntity.ok(payments);
		}

		if (role.equals("ADMIN")) {
			return ResponseEntity.ok(paymentService.getAllPayments());
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

	/*
	 * Get payment by ID.
	 */
	@GetMapping("/{id}")
	public ResponseEntity<Payment> getPaymentById(@PathVariable Long id, Authentication authentication) {

		Payment payment = paymentService.getPaymentById(id);

		if (payment == null) {
			return ResponseEntity.notFound().build();
		}

		if (!customerCanAccessPayment(payment, authentication)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(payment);
	}

	/*
	 * Get payments by user ID.
	 */
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Payment>> getPaymentsByUserId(@PathVariable Long userId, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		/*
		 * CUSTOMER can access only their own user ID.
		 */
		if (role.equals("CUSTOMER") && !user.getId().equals(userId)) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		/*
		 * Only CUSTOMER and ADMIN should access payment information through this
		 * endpoint.
		 */
		if (!role.equals("CUSTOMER") && !role.equals("ADMIN")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId));
	}

	/*
	 * Get payments by parcel ID.
	 */
	@GetMapping("/parcel/{parcelId}")
	public ResponseEntity<List<Payment>> getPaymentsByParcelId(@PathVariable Long parcelId,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		Parcel parcel = parcelRepository.findById(parcelId).orElse(null);

		if (parcel == null) {
			return ResponseEntity.notFound().build();
		}

		/*
		 * CUSTOMER must own the parcel.
		 */
		if (role.equals("CUSTOMER") && !user.getId().equals(parcel.getUserId())) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		/*
		 * Only CUSTOMER and ADMIN can access payment details.
		 */
		if (!role.equals("CUSTOMER") && !role.equals("ADMIN")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(paymentService.getPaymentsByParcelId(parcelId));
	}

	/*
	 * Get payment by transaction ID.
	 */
	@GetMapping("/transaction/{transactionId}")
	public ResponseEntity<Payment> getPaymentByTransactionId(@PathVariable String transactionId,
			Authentication authentication) {

		Payment payment = paymentService.getPaymentByTransactionId(transactionId);

		if (payment == null) {
			return ResponseEntity.notFound().build();
		}

		if (!customerCanAccessPayment(payment, authentication)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(payment);
	}

	/*
	 * Get payments by status.
	 */
	@GetMapping("/status/{status}")
	public ResponseEntity<List<Payment>> getPaymentsByStatus(@PathVariable String status,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = getRole(user);

		if (role.equals("CUSTOMER")) {

			List<Payment> payments = paymentService.getPaymentsByStatus(status).stream()
					.filter(payment -> user.getId().equals(payment.getUserId())).collect(Collectors.toList());

			return ResponseEntity.ok(payments);
		}

		if (role.equals("ADMIN")) {
			return ResponseEntity.ok(paymentService.getPaymentsByStatus(status));
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

	/*
	 * Get currently authenticated user.
	 */
	private User getLoggedInUser(Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {

			return null;
		}

		String email = authentication.getName();

		if (email == null || email.isBlank()) {
			return null;
		}

		return userRepository.findByEmail(email);
	}

	/*
	 * Safely get normalized role.
	 */
	private String getRole(User user) {

		if (user == null || user.getRole() == null) {
			return "";
		}

		return user.getRole().trim().toUpperCase();
	}

	/*
	 * Check whether the logged-in user can access a particular payment.
	 */
	private boolean customerCanAccessPayment(Payment payment, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null || payment == null) {
			return false;
		}

		String role = getRole(user);

		/*
		 * ADMIN can access all payments.
		 */
		if (role.equals("ADMIN")) {
			return true;
		}

		/*
		 * CUSTOMER can access only their own payment.
		 */
		if (role.equals("CUSTOMER")) {
			return user.getId().equals(payment.getUserId());
		}

		return false;
	}
}