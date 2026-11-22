package com.smartcourier.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.Feedback;
import com.smartcourier.repository.FeedbackRepository;

@Service
public class FeedbackService {

	private final FeedbackRepository feedbackRepository;

	public FeedbackService(FeedbackRepository feedbackRepository) {
		this.feedbackRepository = feedbackRepository;
	}

	// Create feedback
	public Feedback createFeedback(Feedback feedback) {

		feedback.setCreatedAt(LocalDateTime.now());

		return feedbackRepository.save(feedback);
	}

	// Get all feedback
	public List<Feedback> getAllFeedback() {
		return feedbackRepository.findAll();
	}

	// Get feedback by ID
	public Optional<Feedback> getFeedbackById(Long id) {
		return feedbackRepository.findById(id);
	}

	// Get feedback by user
	public List<Feedback> getFeedbackByUserId(Long userId) {
		return feedbackRepository.findByUserId(userId);
	}

	// Get feedback by parcel
	public List<Feedback> getFeedbackByParcelId(Long parcelId) {
		return feedbackRepository.findByParcelId(parcelId);
	}

	// Get feedback by rating
	public List<Feedback> getFeedbackByRating(Integer rating) {
		return feedbackRepository.findByRating(rating);
	}
}