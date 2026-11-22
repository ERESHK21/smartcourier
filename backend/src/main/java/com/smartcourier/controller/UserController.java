package com.smartcourier.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.User;
import com.smartcourier.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	// Create user
	@PostMapping
	public ResponseEntity<Map<String, Object>> createUser(@RequestBody User user) {

		User savedUser = userService.createUser(user);

		return ResponseEntity.ok(toSafeUser(savedUser));
	}

	// Get all users
	@GetMapping
	public ResponseEntity<List<Map<String, Object>>> getAllUsers() {

		List<Map<String, Object>> users = userService.getAllUsers().stream().map(this::toSafeUser)
				.collect(Collectors.toList());

		return ResponseEntity.ok(users);
	}

	// Get user by ID
	@GetMapping("/{id}")
	public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {

		User user = userService.getUserById(id);

		if (user == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(toSafeUser(user));
	}

	// Get user by email
	@GetMapping("/email/{email}")
	public ResponseEntity<Map<String, Object>> getUserByEmail(@PathVariable String email) {

		User user = userService.getUserByEmail(email);

		if (user == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(toSafeUser(user));
	}

	// Convert User entity to safe response
	// Password is intentionally NOT included.
	private Map<String, Object> toSafeUser(User user) {

		Map<String, Object> response = new LinkedHashMap<>();

		response.put("id", user.getId());
		response.put("name", user.getName());
		response.put("email", user.getEmail());
		response.put("phone", user.getPhone());
		response.put("role", user.getRole());

		return response;
	}
}