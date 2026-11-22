package com.smartcourier.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.ParcelAssignment;
import com.smartcourier.repository.ParcelAssignmentRepository;

@Service
public class ParcelAssignmentService {

	private final ParcelAssignmentRepository assignmentRepository;
	private final ParcelService parcelService;

	public ParcelAssignmentService(ParcelAssignmentRepository assignmentRepository, ParcelService parcelService) {

		this.assignmentRepository = assignmentRepository;
		this.parcelService = parcelService;
	}

	public ParcelAssignment assignParcel(Long parcelId, Long deliveryAgentId) {

		ParcelAssignment assignment = new ParcelAssignment();

		assignment.setParcelId(parcelId);
		assignment.setDeliveryAgentId(deliveryAgentId);
		assignment.setStatus("ASSIGNED");
		assignment.setAssignedAt(LocalDateTime.now());

		return assignmentRepository.save(assignment);
	}

	public List<ParcelAssignment> getAllAssignments() {
		return assignmentRepository.findAll();
	}

	public ParcelAssignment getAssignmentById(Long id) {
		return assignmentRepository.findById(id).orElse(null);
	}

	public List<ParcelAssignment> getAssignmentsByParcelId(Long parcelId) {
		return assignmentRepository.findByParcelId(parcelId);
	}

	public List<ParcelAssignment> getAssignmentsByAgentId(Long deliveryAgentId) {
		return assignmentRepository.findByDeliveryAgentId(deliveryAgentId);
	}

	public List<ParcelAssignment> getAssignmentsByStatus(String status) {
		return assignmentRepository.findByStatus(status);
	}

	public ParcelAssignment acceptAssignment(Long id) {

		ParcelAssignment assignment = assignmentRepository.findById(id).orElse(null);

		if (assignment == null) {
			return null;
		}

		assignment.setStatus("ACCEPTED");
		assignment.setAcceptedAt(LocalDateTime.now());

		return assignmentRepository.save(assignment);
	}

	public ParcelAssignment completeAssignment(Long id) {

		ParcelAssignment assignment = assignmentRepository.findById(id).orElse(null);

		if (assignment == null) {
			return null;
		}

		assignment.setStatus("COMPLETED");
		assignment.setCompletedAt(LocalDateTime.now());

		// Automatically mark parcel as delivered
		parcelService.updateStatus(assignment.getParcelId(), "DELIVERED");

		return assignmentRepository.save(assignment);
	}
}