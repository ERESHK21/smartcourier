package com.smartcourier.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.TrackingHistory;

public interface TrackingHistoryRepository extends JpaRepository<TrackingHistory, Long> {

	List<TrackingHistory> findByTrackingIdOrderByUpdateTimeAsc(String trackingId);
}