package com.smartcourier.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.TrackingHistory;
import com.smartcourier.service.TrackingHistoryService;

@RestController
@RequestMapping("/api/tracking-history")
@CrossOrigin(origins = "http://localhost:5173")
public class TrackingHistoryController {

	private final TrackingHistoryService trackingHistoryService;

	public TrackingHistoryController(TrackingHistoryService trackingHistoryService) {

		this.trackingHistoryService = trackingHistoryService;
	}

	@PostMapping
	public ResponseEntity<TrackingHistory> createTrackingHistory(@RequestParam String trackingId,
			@RequestParam String status, @RequestParam(required = false) String location,
			@RequestParam(required = false) String description) {

		return ResponseEntity
				.ok(trackingHistoryService.createTrackingHistory(trackingId, status, location, description));
	}

	@GetMapping("/tracking/{trackingId}")
	public ResponseEntity<List<TrackingHistory>> getTrackingHistory(@PathVariable String trackingId) {

		return ResponseEntity.ok(trackingHistoryService.getTrackingHistoryByTrackingId(trackingId));
	}

	@GetMapping
	public ResponseEntity<List<TrackingHistory>> getAllTrackingHistory() {

		return ResponseEntity.ok(trackingHistoryService.getAllTrackingHistory());
	}
}