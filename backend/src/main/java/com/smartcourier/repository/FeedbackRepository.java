package com.smartcourier.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

	List<Feedback> findByUserId(Long userId);

	List<Feedback> findByParcelId(Long parcelId);

	List<Feedback> findByRating(Integer rating);
}