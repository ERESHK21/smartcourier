package com.smartcourier.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.DeliveryAgent;
import com.smartcourier.entity.User;
import com.smartcourier.repository.DeliveryAgentRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.DeliveryAgentService;

@RestController
@RequestMapping("/api/agents")
@CrossOrigin(origins = "http://localhost:5173")
public class DeliveryAgentController {

	private final DeliveryAgentService deliveryAgentService;
	private final UserRepository userRepository;
	private final DeliveryAgentRepository deliveryAgentRepository;

	public DeliveryAgentController(DeliveryAgentService deliveryAgentService, UserRepository userRepository,
			DeliveryAgentRepository deliveryAgentRepository) {

		this.deliveryAgentService = deliveryAgentService;
		this.userRepository = userRepository;
		this.deliveryAgentRepository = deliveryAgentRepository;
	}

	// Create agent
	// Only Manager/Admin
	@PostMapping
	public ResponseEntity<DeliveryAgent> createAgent(@RequestBody DeliveryAgent agent, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (!isManagerOrAdmin(user)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(deliveryAgentService.createAgent(agent));
	}

	// Get all agents
	// Only Manager/Admin
	@GetMapping
	public ResponseEntity<List<DeliveryAgent>> getAllAgents(Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (!isManagerOrAdmin(user)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(deliveryAgentService.getAllAgents());
	}

	// Get agent by ID
	@GetMapping("/{id}")
	public ResponseEntity<DeliveryAgent> getAgentById(@PathVariable Long id, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().toUpperCase();

		DeliveryAgent agent = deliveryAgentService.getAgentById(id);

		if (agent == null) {
			return ResponseEntity.notFound().build();
		}

		// Manager/Admin can access all
		if (isManagerOrAdmin(user)) {
			return ResponseEntity.ok(agent);
		}

		// Agent can access only himself
		if (role.equals("DELIVERY_AGENT") && agent.getUserId().equals(user.getId())) {

			return ResponseEntity.ok(agent);
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

	// Get agent by user id
	@GetMapping("/user/{userId}")
	public ResponseEntity<DeliveryAgent> getAgentByUserId(@PathVariable Long userId, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		if (isManagerOrAdmin(user) || user.getId().equals(userId)) {

			DeliveryAgent agent = deliveryAgentService.getAgentByUserId(userId);

			if (agent == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(agent);
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

	// Get by status
	// Only Manager/Admin
	@GetMapping("/status/{status}")
	public ResponseEntity<List<DeliveryAgent>> getAgentsByStatus(@PathVariable String status,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (!isManagerOrAdmin(user)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(deliveryAgentService.getAgentsByStatus(status));
	}

	// Update agent
	@PutMapping("/{id}")
	public ResponseEntity<DeliveryAgent> updateAgent(@PathVariable Long id, @RequestBody DeliveryAgent agent,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (!canModifyAgent(id, user)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(deliveryAgentService.updateAgent(id, agent));
	}

	// Update status
	@PutMapping("/{id}/status")
	public ResponseEntity<DeliveryAgent> updateStatus(@PathVariable Long id, @RequestParam String status,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (!canModifyAgent(id, user)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(deliveryAgentService.updateStatus(id, status));
	}

	// Update location
	@PutMapping("/{id}/location")
	public ResponseEntity<DeliveryAgent> updateLocation(@PathVariable Long id, @RequestParam String location,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (!canModifyAgent(id, user)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(deliveryAgentService.updateLocation(id, location));
	}

	private boolean canModifyAgent(Long agentId, User user) {

		if (user == null) {
			return false;
		}

		if (isManagerOrAdmin(user)) {
			return true;
		}

		DeliveryAgent agent = deliveryAgentRepository.findById(agentId).orElse(null);

		return agent != null && user.getId().equals(agent.getUserId());
	}

	private boolean isManagerOrAdmin(User user) {

		if (user == null) {
			return false;
		}

		String role = user.getRole().trim().toUpperCase();

		return role.equals("MANAGER") || role.equals("ADMIN");
	}

	private User getLoggedInUser(Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {

			return null;
		}

		return userRepository.findByEmail(authentication.getName());
	}
}