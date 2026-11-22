package com.smartcourier.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "parcel_assignments")
public class ParcelAssignment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long parcelId;

	@Column(name = "agent_id", nullable = false)
	private Long deliveryAgentId;

	@Column(nullable = false)
	private String status;

	@Column(nullable = false)
	private LocalDateTime assignedAt;

	private LocalDateTime acceptedAt;

	private LocalDateTime completedAt;

	public ParcelAssignment() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getParcelId() {
		return parcelId;
	}

	public void setParcelId(Long parcelId) {
		this.parcelId = parcelId;
	}

	public Long getDeliveryAgentId() {
		return deliveryAgentId;
	}

	public void setDeliveryAgentId(Long deliveryAgentId) {
		this.deliveryAgentId = deliveryAgentId;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDateTime getAssignedAt() {
		return assignedAt;
	}

	public void setAssignedAt(LocalDateTime assignedAt) {
		this.assignedAt = assignedAt;
	}

	public LocalDateTime getAcceptedAt() {
		return acceptedAt;
	}

	public void setAcceptedAt(LocalDateTime acceptedAt) {
		this.acceptedAt = acceptedAt;
	}

	public LocalDateTime getCompletedAt() {
		return completedAt;
	}

	public void setCompletedAt(LocalDateTime completedAt) {
		this.completedAt = completedAt;
	}
}