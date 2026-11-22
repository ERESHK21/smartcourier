package com.smartcourier.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.Complaint;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

	List<Complaint> findByUserId(Long userId);

	List<Complaint> findByParcelId(Long parcelId);

	List<Complaint> findByStatus(String status);
}