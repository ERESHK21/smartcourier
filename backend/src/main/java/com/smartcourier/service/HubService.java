package com.smartcourier.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.Hub;
import com.smartcourier.repository.HubRepository;

@Service
public class HubService {

	private final HubRepository hubRepository;

	public HubService(HubRepository hubRepository) {
		this.hubRepository = hubRepository;
	}

	public Hub createHub(Hub hub) {
		if (hub.getStatus() == null || hub.getStatus().isBlank()) {
			hub.setStatus("ACTIVE");
		}

		return hubRepository.save(hub);
	}

	public List<Hub> getAllHubs() {
		return hubRepository.findAll();
	}

	public Hub getHubById(Long id) {
		return hubRepository.findById(id).orElse(null);
	}

	public List<Hub> getHubsByCity(String city) {
		return hubRepository.findByCity(city);
	}

	public List<Hub> getHubsByStatus(String status) {
		return hubRepository.findByStatus(status);
	}

	public Hub updateHub(Long id, Hub updatedHub) {

		Hub hub = hubRepository.findById(id).orElse(null);

		if (hub == null) {
			return null;
		}

		hub.setHubName(updatedHub.getHubName());
		hub.setCity(updatedHub.getCity());
		hub.setAddress(updatedHub.getAddress());
		hub.setContactNumber(updatedHub.getContactNumber());
		hub.setStatus(updatedHub.getStatus());

		return hubRepository.save(hub);
	}

	public void deleteHub(Long id) {
		hubRepository.deleteById(id);
	}
}