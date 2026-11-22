package com.smartcourier.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.ParcelAssignment;

public interface ParcelAssignmentRepository extends JpaRepository<ParcelAssignment, Long> {

	List<ParcelAssignment> findByDeliveryAgentId(Long deliveryAgentId);

	List<ParcelAssignment> findByParcelId(Long parcelId);

	Optional<ParcelAssignment> findByParcelIdAndDeliveryAgentId(Long parcelId, Long deliveryAgentId);

	List<ParcelAssignment> findByStatus(String status);
}