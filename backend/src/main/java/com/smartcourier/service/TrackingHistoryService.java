package com.smartcourier.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.TrackingHistory;
import com.smartcourier.repository.TrackingHistoryRepository;

@Service
public class TrackingHistoryService {

	private final TrackingHistoryRepository trackingHistoryRepository;

	public TrackingHistoryService(TrackingHistoryRepository trackingHistoryRepository) {

		this.trackingHistoryRepository = trackingHistoryRepository;
	}

	public TrackingHistory createTrackingHistory(String trackingId, String status, String location,
			String description) {

		TrackingHistory history = new TrackingHistory();

		history.setTrackingId(trackingId);
		history.setStatus(status);
		history.setLocation(location);
		history.setDescription(description);
		history.setUpdateTime(LocalDateTime.now());

		return trackingHistoryRepository.save(history);
	}

	public List<TrackingHistory> getTrackingHistoryByTrackingId(String trackingId) {

		return trackingHistoryRepository.findByTrackingIdOrderByUpdateTimeAsc(trackingId);
	}

	public List<TrackingHistory> getAllTrackingHistory() {

		return trackingHistoryRepository.findAll();
	}
}