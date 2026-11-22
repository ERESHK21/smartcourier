package com.smartcourier.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.ChatHistory;
import com.smartcourier.entity.Parcel;
import com.smartcourier.repository.ChatHistoryRepository;
import com.smartcourier.repository.ParcelRepository;

@Service
public class ChatbotService {

	private final ChatHistoryRepository chatHistoryRepository;
	private final ParcelRepository parcelRepository;
	private final DeliveryPredictionService predictionService;

	public ChatbotService(ChatHistoryRepository chatHistoryRepository, ParcelRepository parcelRepository,
			DeliveryPredictionService predictionService) {

		this.chatHistoryRepository = chatHistoryRepository;
		this.parcelRepository = parcelRepository;
		this.predictionService = predictionService;
	}

	public String getResponse(Long userId, String message) {

		String userMessage = message.toLowerCase().trim();

		String response;

		// AI DELIVERY PREDICTION
		if (isPredictionQuestion(userMessage)) {

			response = handlePredictionRequest(userId, message);
		}

		// TRACK / STATUS
		else if (isStatusQuestion(userMessage)) {

			response = getParcelStatus(userId, message);
		}

		// DELIVERY CHARGE
		else if (userMessage.contains("charge") || userMessage.contains("price") || userMessage.contains("cost")
				|| userMessage.contains("delivery charge")) {

			response = getDeliveryCharge(userId, message);
		}

		// GREETING
		else if (userMessage.contains("hello") || userMessage.equals("hi") || userMessage.startsWith("hi ")
				|| userMessage.contains("hey")) {

			response = "Hello! 👋 I'm Smart Courier AI. I can help you with parcel tracking, delivery status, charges and AI prediction.";
		}

		// HELP
		else if (userMessage.contains("help")) {

			response = "I can help you with parcel tracking, delivery charges, delivery status, and AI delivery prediction.";
		}

		// GENERAL DELIVERY INFORMATION
		else if (userMessage.contains("delivery")) {

			response = "You can ask me about your parcel status, delivery charges, tracking, or AI delivery prediction.";
		}

		// UNKNOWN
		else {

			response = "Sorry, I didn't understand. Please ask about parcel tracking, delivery status, charges, or delivery prediction.";
		}

		// SAVE CHAT HISTORY
		ChatHistory chatHistory = new ChatHistory();

		chatHistory.setUserId(userId);
		chatHistory.setMessage(message);
		chatHistory.setResponse(response);
		chatHistory.setCreatedAt(LocalDateTime.now());

		chatHistoryRepository.save(chatHistory);

		return response;
	}

	// =============================================================
	// STATUS QUESTION DETECTION
	// =============================================================

	private boolean isStatusQuestion(String message) {

		return message.contains("track") || message.contains("tracking") || message.contains("where is my parcel")
				|| message.contains("where's my parcel") || message.contains("status of my parcel")
				|| message.contains("status of my latest parcel") || message.contains("latest parcel status")
				|| message.contains("my parcel status") || message.contains("delivery status")
				|| message.contains("my delivery status") || message.contains("current status")
				|| message.equals("status") || message.equals("track parcel");
	}

	// =============================================================
	// AI PREDICTION QUESTION DETECTION
	// =============================================================

	private boolean isPredictionQuestion(String message) {

		if (message.contains("how long") || message.contains("delivery time") || message.contains("delivery prediction")
				|| message.contains("predict delivery") || message.contains("prediction")
				|| message.contains("how many days") || message.contains("take to deliver")
				|| message.contains("when will my parcel arrive")
				|| message.contains("when will my parcel be delivered")
				|| message.contains("when will my parcel deliver") || message.contains("when can i expect my parcel")
				|| message.contains("when can i expect") || message.contains("estimated delivery time")
				|| message.contains("estimated delivery") || message.contains("how much time will delivery take")
				|| message.contains("how much time will my parcel take")) {

			return true;
		}

		if (message.contains("hub delay") || message.contains("hubdelay")) {

			return true;
		}

		Pattern distancePattern = Pattern.compile("^\\s*\\d+(?:\\.\\d+)?\\s*(?:km|kilometers?)\\s*$",
				Pattern.CASE_INSENSITIVE);

		return distancePattern.matcher(message).matches();
	}

	// =============================================================
	// AI DELIVERY PREDICTION
	// =============================================================

	private String handlePredictionRequest(Long userId, String message) {

		Pattern trackingPattern = Pattern.compile("TRK-[A-Z0-9]{8}", Pattern.CASE_INSENSITIVE);

		Matcher trackingMatcher = trackingPattern.matcher(message);

		Parcel parcel = null;

		// Tracking ID provided
		if (trackingMatcher.find()) {

			String trackingId = trackingMatcher.group().toUpperCase();

			Optional<Parcel> optionalParcel = parcelRepository.findByTrackingId(trackingId);

			if (optionalParcel.isEmpty()) {

				return "Sorry, I could not find a parcel with tracking ID " + trackingId + ".";
			}

			parcel = optionalParcel.get();

			// SECURITY: customer can only use their own parcel
			if (!userId.equals(parcel.getUserId())) {

				return "Sorry, you are not authorized to access this parcel.";
			}
		}

		// Use latest customer's parcel when tracking ID is not provided
		if (parcel == null) {

			List<Parcel> userParcels = parcelRepository.findByUserIdOrderByBookingDateDesc(userId);

			if (userParcels.isEmpty()) {

				return "You don't have any parcels yet. Please book a parcel first.";
			}

			parcel = userParcels.get(0);
		}

		// Extract distance
		Pattern distancePattern = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:km|kilometers?)?",
				Pattern.CASE_INSENSITIVE);

		Matcher distanceMatcher = distancePattern.matcher(message);

		double distance;

		if (distanceMatcher.find()) {

			distance = Double.parseDouble(distanceMatcher.group(1));

		} else {

			return "Please provide the delivery distance for AI prediction. Example: 75 km.";
		}

		// Extract hub delay
		double hubDelay = 0;

		Pattern delayPattern = Pattern.compile("(?:hub\\s*delay|delay)\\s*(?:of)?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:days?)?",
				Pattern.CASE_INSENSITIVE);

		Matcher delayMatcher = delayPattern.matcher(message);

		if (delayMatcher.find()) {

			hubDelay = Double.parseDouble(delayMatcher.group(1));
		}

		// ML prediction
		try {

			double predictedDays = predictionService.predictDeliveryDays(parcel.getWeight(), distance,
					parcel.getDeliveryType(), hubDelay);

			long roundedDays = Math.round(predictedDays);

			if (roundedDays < 1) {
				roundedDays = 1;
			}

			return "🤖 AI predicts that your parcel " + parcel.getTrackingId() + " may take approximately "
					+ roundedDays + " day" + (roundedDays == 1 ? "" : "s") + " to deliver.";

		} catch (Exception e) {

			e.printStackTrace();

			return "Sorry, I could not calculate the delivery prediction right now.";
		}
	}

	// =============================================================
	// TRACK / STATUS
	// =============================================================

	private String getParcelStatus(Long userId, String message) {

		Pattern pattern = Pattern.compile("TRK-[A-Z0-9]{8}", Pattern.CASE_INSENSITIVE);

		Matcher matcher = pattern.matcher(message);

		Parcel parcel = null;

		// Tracking ID provided
		if (matcher.find()) {

			String trackingId = matcher.group().toUpperCase();

			Optional<Parcel> parcelOptional = parcelRepository.findByTrackingId(trackingId);

			if (parcelOptional.isEmpty()) {

				return "Sorry, I could not find a parcel with tracking ID " + trackingId + ".";
			}

			parcel = parcelOptional.get();

			// SECURITY: customer can only see their own parcel
			if (!userId.equals(parcel.getUserId())) {

				return "Sorry, you are not authorized to access this parcel.";
			}

		} else {

			// No tracking ID:
			// automatically use customer's latest parcel
			List<Parcel> userParcels = parcelRepository.findByUserIdOrderByBookingDateDesc(userId);

			if (userParcels.isEmpty()) {

				return "You don't have any parcels yet. Please book a parcel first.";
			}

			parcel = userParcels.get(0);
		}

		return "📦 Your parcel " + parcel.getTrackingId() + " is currently " + formatStatus(parcel.getStatus()) + ".";
	}

	// =============================================================
	// DELIVERY CHARGE
	// =============================================================

	private String getDeliveryCharge(Long userId, String message) {

		Pattern pattern = Pattern.compile("TRK-[A-Z0-9]{8}", Pattern.CASE_INSENSITIVE);

		Matcher matcher = pattern.matcher(message);

		Parcel parcel = null;

		// Tracking ID provided
		if (matcher.find()) {

			String trackingId = matcher.group().toUpperCase();

			Optional<Parcel> parcelOptional = parcelRepository.findByTrackingId(trackingId);

			if (parcelOptional.isEmpty()) {

				return "Sorry, I could not find a parcel with tracking ID " + trackingId + ".";
			}

			parcel = parcelOptional.get();

			// SECURITY: customer can only see their own parcel
			if (!userId.equals(parcel.getUserId())) {

				return "Sorry, you are not authorized to access this parcel.";
			}
		}

		// No tracking ID: use latest customer's parcel
		if (parcel == null) {

			List<Parcel> userParcels = parcelRepository.findByUserIdOrderByBookingDateDesc(userId);

			if (userParcels.isEmpty()) {

				return "You don't have any parcels yet. Please book a parcel first.";
			}

			parcel = userParcels.get(0);
		}

		return "💰 The delivery charge for parcel " + parcel.getTrackingId() + " is ₹"
				+ String.format("%.2f", parcel.getDeliveryCharge()) + ".";
	}

	// =============================================================
	// STATUS FORMAT
	// =============================================================

	private String formatStatus(String status) {

		if (status == null) {
			return "UNKNOWN";
		}

		if ("IN_TRANSIT".equalsIgnoreCase(status)) {
			return "IN TRANSIT";
		}

		if ("DELIVERED".equalsIgnoreCase(status)) {
			return "DELIVERED";
		}

		if ("BOOKED".equalsIgnoreCase(status)) {
			return "BOOKED";
		}

		if ("CANCELLED".equalsIgnoreCase(status)) {
			return "CANCELLED";
		}

		return status.toUpperCase();
	}
}