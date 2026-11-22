package com.smartcourier.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.Hub;
import com.smartcourier.service.HubService;

@RestController
@RequestMapping("/api/hubs")
@CrossOrigin(origins = "http://localhost:5173")
public class HubController {

	private final HubService hubService;

	public HubController(HubService hubService) {
		this.hubService = hubService;
	}

	@PostMapping
	public ResponseEntity<Hub> createHub(@RequestBody Hub hub) {
		return ResponseEntity.ok(hubService.createHub(hub));
	}

	@GetMapping
	public ResponseEntity<List<Hub>> getAllHubs() {
		return ResponseEntity.ok(hubService.getAllHubs());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Hub> getHubById(@PathVariable Long id) {

		Hub hub = hubService.getHubById(id);

		if (hub == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(hub);
	}

	@GetMapping("/city/{city}")
	public ResponseEntity<List<Hub>> getHubsByCity(@PathVariable String city) {
		return ResponseEntity.ok(hubService.getHubsByCity(city));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<List<Hub>> getHubsByStatus(@PathVariable String status) {
		return ResponseEntity.ok(hubService.getHubsByStatus(status));
	}

	@PutMapping("/{id}")
	public ResponseEntity<Hub> updateHub(@PathVariable Long id, @RequestBody Hub hub) {

		Hub updatedHub = hubService.updateHub(id, hub);

		if (updatedHub == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(updatedHub);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteHub(@PathVariable Long id) {

		if (hubService.getHubById(id) == null) {
			return ResponseEntity.notFound().build();
		}

		hubService.deleteHub(id);

		return ResponseEntity.noContent().build();
	}
}