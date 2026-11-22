package com.smartcourier.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.service.ChatbotService;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

	private final ChatbotService chatbotService;

	public ChatbotController(ChatbotService chatbotService) {
		this.chatbotService = chatbotService;
	}

	@PostMapping("/chat")
	public ResponseEntity<String> chat(@RequestBody Map<String, Object> request) {

		Long userId = Long.valueOf(request.get("userId").toString());

		String message = request.get("message").toString();

		String response = chatbotService.getResponse(userId, message);

		return ResponseEntity.ok(response);
	}
}