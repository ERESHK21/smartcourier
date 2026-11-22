package com.smartcourier.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

	List<Payment> findByUserIdOrderByPaymentDateDesc(Long userId);

	List<Payment> findByParcelId(Long parcelId);

	Optional<Payment> findByTransactionId(String transactionId);

	List<Payment> findByPaymentStatus(String paymentStatus);
}