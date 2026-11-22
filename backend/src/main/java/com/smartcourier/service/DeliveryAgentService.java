package com.smartcourier.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.DeliveryAgent;
import com.smartcourier.repository.DeliveryAgentRepository;

@Service
public class DeliveryAgentService {

	private final DeliveryAgentRepository deliveryAgentRepository;

	public DeliveryAgentService(DeliveryAgentRepository deliveryAgentRepository) {

		this.deliveryAgentRepository = deliveryAgentRepository;
	}

	// Create delivery agent
	public DeliveryAgent createAgent(DeliveryAgent agent) {

		if (agent.getStatus() == null || agent.getStatus().isBlank()) {
			agent.setStatus("AVAILABLE");
		}

		return deliveryAgentRepository.save(agent);
	}

	// Get all agents
	public List<DeliveryAgent> getAllAgents() {

		return deliveryAgentRepository.findAll();
	}

	// Get agent by ID
	public DeliveryAgent getAgentById(Long id) {

		return deliveryAgentRepository.findById(id).orElse(null);
	}

	// Get agent by user ID
	public DeliveryAgent getAgentByUserId(Long userId) {

		return deliveryAgentRepository.findByUserId(userId).orElse(null);
	}

	// Get agent by vehicle number
	public DeliveryAgent getAgentByVehicleNumber(String vehicleNumber) {

		return deliveryAgentRepository.findByVehicleNumber(vehicleNumber).orElse(null);
	}

	// Get agents by status
	public List<DeliveryAgent> getAgentsByStatus(String status) {

		return deliveryAgentRepository.findByStatus(status);
	}

	// Update agent
	public DeliveryAgent updateAgent(Long id, DeliveryAgent updatedAgent) {

		DeliveryAgent agent = deliveryAgentRepository.findById(id).orElse(null);

		if (agent == null) {
			return null;
		}

		agent.setUserId(updatedAgent.getUserId());
		agent.setName(updatedAgent.getName());
		agent.setPhone(updatedAgent.getPhone());
		agent.setVehicleNumber(updatedAgent.getVehicleNumber());
		agent.setVehicleType(updatedAgent.getVehicleType());
		agent.setStatus(updatedAgent.getStatus());
		agent.setCurrentLocation(updatedAgent.getCurrentLocation());

		return deliveryAgentRepository.save(agent);
	}

	// Update agent status
	public DeliveryAgent updateStatus(Long id, String status) {

		DeliveryAgent agent = deliveryAgentRepository.findById(id).orElse(null);

		if (agent == null) {
			return null;
		}

		agent.setStatus(status);

		return deliveryAgentRepository.save(agent);
	}

	// Update current location
	public DeliveryAgent updateLocation(Long id, String location) {

		DeliveryAgent agent = deliveryAgentRepository.findById(id).orElse(null);

		if (agent == null) {
			return null;
		}

		agent.setCurrentLocation(location);

		return deliveryAgentRepository.save(agent);
	}
}