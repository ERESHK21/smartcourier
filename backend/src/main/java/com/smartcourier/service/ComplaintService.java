package com.smartcourier.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.Complaint;
import com.smartcourier.repository.ComplaintRepository;

@Service
public class ComplaintService {

	private final ComplaintRepository complaintRepository;

	public ComplaintService(ComplaintRepository complaintRepository) {
		this.complaintRepository = complaintRepository;
	}

	// Create complaint
	public Complaint createComplaint(Complaint complaint) {

		complaint.setStatus("OPEN");
		complaint.setCreatedAt(LocalDateTime.now());

		return complaintRepository.save(complaint);
	}

	// Get all complaints
	public List<Complaint> getAllComplaints() {
		return complaintRepository.findAll();
	}

	// Get complaint by ID
	public Optional<Complaint> getComplaintById(Long id) {
		return complaintRepository.findById(id);
	}

	// Get complaints by user
	public List<Complaint> getComplaintsByUserId(Long userId) {
		return complaintRepository.findByUserId(userId);
	}

	// Get complaints by parcel
	public List<Complaint> getComplaintsByParcelId(Long parcelId) {
		return complaintRepository.findByParcelId(parcelId);
	}

	// Get complaints by status
	public List<Complaint> getComplaintsByStatus(String status) {
		return complaintRepository.findByStatus(status);
	}

	// Update complaint status
	public Complaint updateStatus(Long id, String status) {

		Optional<Complaint> optionalComplaint = complaintRepository.findById(id);

		if (optionalComplaint.isEmpty()) {
			return null;
		}

		Complaint complaint = optionalComplaint.get();

		complaint.setStatus(status);

		return complaintRepository.save(complaint);
	}
}