package com.smartcourier.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

@Service
public class RazorpayService {

	private final RazorpayClient razorpayClient;

	@Value("${razorpay.key.secret}")
	private String razorpaySecret;

	public RazorpayService(RazorpayClient razorpayClient) {
		this.razorpayClient = razorpayClient;
	}

	// =========================================================
	// CREATE RAZORPAY ORDER
	// =========================================================

	public Order createOrder(double amount, String receipt) throws Exception {

		int amountInPaise = (int) Math.round(amount * 100);

		JSONObject orderRequest = new JSONObject();

		orderRequest.put("amount", amountInPaise);
		orderRequest.put("currency", "INR");
		orderRequest.put("receipt", receipt);
		orderRequest.put("payment_capture", 1);

		return razorpayClient.orders.create(orderRequest);
	}

	// =========================================================
	// VERIFY RAZORPAY PAYMENT
	// =========================================================

	public boolean verifyPayment(String orderId, String paymentId, String signature) {

		try {

			JSONObject attributes = new JSONObject();

			attributes.put("razorpay_order_id", orderId);

			attributes.put("razorpay_payment_id", paymentId);

			attributes.put("razorpay_signature", signature);

			return Utils.verifyPaymentSignature(attributes, razorpaySecret);

		} catch (Exception e) {

			System.out.println("Razorpay verification failed: " + e.getMessage());

			return false;
		}
	}
}