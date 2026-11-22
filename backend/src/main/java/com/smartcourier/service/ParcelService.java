package com.smartcourier.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.Parcel;
import com.smartcourier.repository.ParcelRepository;

@Service
public class ParcelService {

	private final ParcelRepository parcelRepository;
	private final TrackingHistoryService trackingHistoryService;
	private final NotificationService notificationService;

	public ParcelService(ParcelRepository parcelRepository, TrackingHistoryService trackingHistoryService,
			NotificationService notificationService) {

		this.parcelRepository = parcelRepository;
		this.trackingHistoryService = trackingHistoryService;
		this.notificationService = notificationService;
	}

	public Parcel createParcel(Parcel parcel, Long userId) {

		// Set customer
		parcel.setUserId(userId);

		// Generate tracking ID
		String trackingId = "TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

		parcel.setTrackingId(trackingId);

		// Shipment status
		parcel.setStatus("BOOKED");

		// Payment status
		parcel.setPaymentStatus("PENDING");

		// Booking date
		parcel.setBookingDate(LocalDateTime.now());

		// Calculate delivery charge
		double baseCharge = 50;

		double weightCharge = parcel.getWeight() * 20;

		double expressCharge = "EXPRESS".equalsIgnoreCase(parcel.getDeliveryType()) ? 100 : 0;

		parcel.setDeliveryCharge(baseCharge + weightCharge + expressCharge);

		// Save parcel
		Parcel savedParcel = parcelRepository.save(parcel);

		// Save tracking history
		trackingHistoryService.createTrackingHistory(savedParcel.getTrackingId(), "BOOKED",
				savedParcel.getPickupAddress(), "Parcel booked successfully");

		// Create notification
		notificationService.createNotification(savedParcel.getUserId(), savedParcel.getId(), "Parcel Booked",
				"Your parcel " + savedParcel.getTrackingId() + " has been booked successfully.");

		return savedParcel;
	}

	public List<Parcel> getAllParcels() {
		return parcelRepository.findAll();
	}

	public List<Parcel> getParcelsByUserId(Long userId) {
		return parcelRepository.findByUserIdOrderByBookingDateDesc(userId);
	}

	public Parcel getParcelById(Long id) {
		return parcelRepository.findById(id).orElse(null);
	}

	public Parcel getParcelByTrackingId(String trackingId) {
		return parcelRepository.findByTrackingId(trackingId).orElse(null);
	}

	public Parcel updateStatus(Long id, String status) {

		Parcel parcel = parcelRepository.findById(id).orElse(null);

		if (parcel == null) {
			return null;
		}

		// Update shipment status only
		parcel.setStatus(status);

		Parcel updatedParcel = parcelRepository.save(parcel);

		// Save tracking history
		trackingHistoryService.createTrackingHistory(updatedParcel.getTrackingId(), status,
				updatedParcel.getDeliveryAddress(), "Parcel status changed to " + status);

		String title = "Parcel " + formatStatus(status);

		String message;

		if ("IN_TRANSIT".equalsIgnoreCase(status)) {

			message = "Your parcel " + updatedParcel.getTrackingId() + " is now in transit.";

		} else if ("DELIVERED".equalsIgnoreCase(status)) {

			message = "Your parcel " + updatedParcel.getTrackingId() + " has been delivered successfully.";

		} else {

			message = "Your parcel " + updatedParcel.getTrackingId() + " status is now " + status + ".";
		}

		// Create notification
		notificationService.createNotification(updatedParcel.getUserId(), updatedParcel.getId(), title, message);

		return updatedParcel;
	}

	private String formatStatus(String status) {

		if ("IN_TRANSIT".equalsIgnoreCase(status)) {
			return "In Transit";
		}

		if ("DELIVERED".equalsIgnoreCase(status)) {
			return "Delivered";
		}

		if ("BOOKED".equalsIgnoreCase(status)) {
			return "Booked";
		}

		return status;
	}
}