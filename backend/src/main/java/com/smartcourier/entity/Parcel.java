package com.smartcourier.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "parcels")
public class Parcel {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String trackingId;

	@Column(nullable = false)
	private String senderName;

	@Column(nullable = false)
	private String receiverName;

	@Column(nullable = false)
	private String pickupAddress;

	@Column(nullable = false)
	private String deliveryAddress;

	@Column(nullable = false)
	private Double weight;

	@Column(nullable = false)
	private String deliveryType;

	@Column(nullable = false)
	private Double deliveryCharge;

	// Shipment/delivery status
	@Column(nullable = false)
	private String status;

	// Payment status: PENDING / PAID
	@Column(nullable = false)
	private String paymentStatus;

	@Column(nullable = false)
	private LocalDateTime bookingDate;

	/*
	 * ID of the customer who booked this parcel.
	 */
	@Column(nullable = false)
	private Long userId;

	public Parcel() {
		super();
	}

	public Parcel(Long id, String trackingId, String senderName, String receiverName, String pickupAddress,
			String deliveryAddress, Double weight, String deliveryType, Double deliveryCharge, String status,
			String paymentStatus, LocalDateTime bookingDate, Long userId) {

		this.id = id;
		this.trackingId = trackingId;
		this.senderName = senderName;
		this.receiverName = receiverName;
		this.pickupAddress = pickupAddress;
		this.deliveryAddress = deliveryAddress;
		this.weight = weight;
		this.deliveryType = deliveryType;
		this.deliveryCharge = deliveryCharge;
		this.status = status;
		this.paymentStatus = paymentStatus;
		this.bookingDate = bookingDate;
		this.userId = userId;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTrackingId() {
		return trackingId;
	}

	public void setTrackingId(String trackingId) {
		this.trackingId = trackingId;
	}

	public String getSenderName() {
		return senderName;
	}

	public void setSenderName(String senderName) {
		this.senderName = senderName;
	}

	public String getReceiverName() {
		return receiverName;
	}

	public void setReceiverName(String receiverName) {
		this.receiverName = receiverName;
	}

	public String getPickupAddress() {
		return pickupAddress;
	}

	public void setPickupAddress(String pickupAddress) {
		this.pickupAddress = pickupAddress;
	}

	public String getDeliveryAddress() {
		return deliveryAddress;
	}

	public void setDeliveryAddress(String deliveryAddress) {
		this.deliveryAddress = deliveryAddress;
	}

	public Double getWeight() {
		return weight;
	}

	public void setWeight(Double weight) {
		this.weight = weight;
	}

	public String getDeliveryType() {
		return deliveryType;
	}

	public void setDeliveryType(String deliveryType) {
		this.deliveryType = deliveryType;
	}

	public Double getDeliveryCharge() {
		return deliveryCharge;
	}

	public void setDeliveryCharge(Double deliveryCharge) {
		this.deliveryCharge = deliveryCharge;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getPaymentStatus() {
		return paymentStatus;
	}

	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}

	public LocalDateTime getBookingDate() {
		return bookingDate;
	}

	public void setBookingDate(LocalDateTime bookingDate) {
		this.bookingDate = bookingDate;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	@Override
	public String toString() {
		return "Parcel [id=" + id + ", trackingId=" + trackingId + ", senderName=" + senderName + ", receiverName="
				+ receiverName + ", pickupAddress=" + pickupAddress + ", deliveryAddress=" + deliveryAddress
				+ ", weight=" + weight + ", deliveryType=" + deliveryType + ", deliveryCharge=" + deliveryCharge
				+ ", status=" + status + ", paymentStatus=" + paymentStatus + ", bookingDate=" + bookingDate
				+ ", userId=" + userId + "]";
	}
}