package com.smartcourier.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.Notification;
import com.smartcourier.repository.NotificationRepository;

@Service
public class NotificationService {

	private final NotificationRepository notificationRepository;

	public NotificationService(NotificationRepository notificationRepository) {
		this.notificationRepository = notificationRepository;
	}

	public Notification createNotification(Long userId, Long parcelId, String title, String message) {

		Notification notification = new Notification();

		notification.setUserId(userId);
		notification.setParcelId(parcelId);
		notification.setTitle(title);
		notification.setMessage(message);
		notification.setRead(false);
		notification.setCreatedAt(LocalDateTime.now());

		return notificationRepository.save(notification);
	}

	public List<Notification> getUserNotifications(Long userId) {

		return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
	}

	public List<Notification> getUnreadNotifications(Long userId) {

		return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
	}

	public Notification getNotificationById(Long id) {

		return notificationRepository.findById(id).orElse(null);
	}

	public Notification markAsRead(Long id) {

		Notification notification = notificationRepository.findById(id).orElse(null);

		if (notification == null) {
			return null;
		}

		notification.setRead(true);

		return notificationRepository.save(notification);
	}
}