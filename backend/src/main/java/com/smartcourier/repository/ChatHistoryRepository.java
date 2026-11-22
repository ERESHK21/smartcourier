package com.smartcourier.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.ChatHistory;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {

	List<ChatHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}