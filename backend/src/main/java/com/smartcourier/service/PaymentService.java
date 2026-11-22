package com.smartcourier.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.Payment;
import com.smartcourier.repository.PaymentRepository;

@Service
public class PaymentService {

	private final PaymentRepository paymentRepository;

	public PaymentService(PaymentRepository paymentRepository) {
		this.paymentRepository = paymentRepository;
	}

	/*
	 * Legacy payment creation method.
	 *
	 * Razorpay payments are now created and verified through:
	 * /api/razorpay/create-order /api/razorpay/verify-payment
	 *
	 * Therefore, this method must NOT mark a payment as SUCCESS.
	 */
	public Payment createPayment(Payment payment) {

		payment.setPaymentStatus("PENDING");
		payment.setPaymentDate(LocalDateTime.now());

		/*
		 * This is only a temporary reference for the legacy payment endpoint. It is NOT
		 * a real transaction ID.
		 */
		String transactionId = "PENDING-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

		payment.setTransactionId(transactionId);

		return paymentRepository.save(payment);
	}

	public List<Payment> getAllPayments() {
		return paymentRepository.findAll();
	}

	public Payment getPaymentById(Long id) {
		return paymentRepository.findById(id).orElse(null);
	}

	public List<Payment> getPaymentsByUserId(Long userId) {
		return paymentRepository.findByUserIdOrderByPaymentDateDesc(userId);
	}

	public List<Payment> getPaymentsByParcelId(Long parcelId) {
		return paymentRepository.findByParcelId(parcelId);
	}

	public Payment getPaymentByTransactionId(String transactionId) {
		return paymentRepository.findByTransactionId(transactionId).orElse(null);
	}

	public List<Payment> getPaymentsByStatus(String status) {
		return paymentRepository.findByPaymentStatus(status);
	}
}