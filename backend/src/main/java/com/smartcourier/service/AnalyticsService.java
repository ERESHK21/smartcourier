package com.smartcourier.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcourier.dto.AnalyticsResponse;
import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.Payment;
import com.smartcourier.repository.DeliveryAgentRepository;
import com.smartcourier.repository.ParcelRepository;
import com.smartcourier.repository.PaymentRepository;
import com.smartcourier.repository.UserRepository;

@Service
public class AnalyticsService {

	private final UserRepository userRepository;
	private final ParcelRepository parcelRepository;
	private final DeliveryAgentRepository agentRepository;
	private final PaymentRepository paymentRepository;

	public AnalyticsService(UserRepository userRepository, ParcelRepository parcelRepository,
			DeliveryAgentRepository agentRepository, PaymentRepository paymentRepository) {

		this.userRepository = userRepository;
		this.parcelRepository = parcelRepository;
		this.agentRepository = agentRepository;
		this.paymentRepository = paymentRepository;
	}

	public AnalyticsResponse getAnalytics() {

		// =========================
		// USERS
		// =========================
		long totalUsers = userRepository.count();

		// =========================
		// PARCELS
		// =========================
		List<Parcel> parcels = parcelRepository.findAll();

		long totalParcels = parcels.size();

		long deliveredParcels = parcels.stream().filter(p -> "DELIVERED".equalsIgnoreCase(p.getStatus())).count();

		long pendingParcels = parcels.stream().filter(p -> !"DELIVERED".equalsIgnoreCase(p.getStatus())).count();

		// =========================
		// DELIVERY AGENTS
		// =========================
		long totalAgents = agentRepository.count();

		long availableAgents = agentRepository.findByStatus("AVAILABLE").size();

		// =========================
		// REVENUE
		// =========================
		List<Payment> payments = paymentRepository.findAll();

		double totalRevenue = payments.stream().filter(
				p -> "SUCCESS".equalsIgnoreCase(p.getPaymentStatus()) || "PAID".equalsIgnoreCase(p.getPaymentStatus()))
				.mapToDouble(Payment::getAmount).sum();

		// =========================
		// RESPONSE
		// =========================
		return new AnalyticsResponse(totalUsers, totalParcels, deliveredParcels, pendingParcels, totalAgents,
				availableAgents, totalRevenue);
	}
}