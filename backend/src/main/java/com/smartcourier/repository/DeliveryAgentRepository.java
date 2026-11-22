package com.smartcourier.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.DeliveryAgent;

public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {

	Optional<DeliveryAgent> findByUserId(Long userId);

	Optional<DeliveryAgent> findByVehicleNumber(String vehicleNumber);

	List<DeliveryAgent> findByStatus(String status);
}