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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.Notification;
import com.smartcourier.entity.User;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

	private final NotificationService notificationService;
	private final UserRepository userRepository;

	public NotificationController(NotificationService notificationService, UserRepository userRepository) {

		this.notificationService = notificationService;
		this.userRepository = userRepository;
	}

	@PostMapping
	public ResponseEntity<Notification> createNotification(@RequestParam Long userId, @RequestParam Long parcelId,
			@RequestParam String title, @RequestParam String message, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		if (!role.equals("MANAGER") && !role.equals("ADMIN")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(notificationService.createNotification(userId, parcelId, title, message));
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		if (role.equals("CUSTOMER") && !user.getId().equals(userId)) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(notificationService.getUserNotifications(userId));
	}

	@GetMapping("/unread/{userId}")
	public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long userId,
			Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String role = user.getRole().trim().toUpperCase();

		if (role.equals("CUSTOMER") && !user.getId().equals(userId)) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
	}

	@PutMapping("/{id}/read")
	public ResponseEntity<Notification> markAsRead(@PathVariable Long id, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		Notification notification = notificationService.getNotificationById(id);

		if (notification == null) {
			return ResponseEntity.notFound().build();
		}

		String role = user.getRole().trim().toUpperCase();

		// CUSTOMER can mark only their own notification as read
		if (role.equals("CUSTOMER") && !user.getId().equals(notification.getUserId())) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		return ResponseEntity.ok(notificationService.markAsRead(id));
	}

	private User getLoggedInUser(Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {
			return null;
		}

		String email = authentication.getName();

		return userRepository.findByEmail(email);
	}
}