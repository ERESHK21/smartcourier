package com.smartcourier.service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.Payment;
import com.smartcourier.repository.ParcelRepository;
import com.smartcourier.repository.PaymentRepository;

@Service
public class InvoiceService {

	private final ParcelRepository parcelRepository;
	private final PaymentRepository paymentRepository;

	public InvoiceService(ParcelRepository parcelRepository, PaymentRepository paymentRepository) {

		this.parcelRepository = parcelRepository;
		this.paymentRepository = paymentRepository;
	}

	public byte[] generateInvoice(Long parcelId) throws Exception {

		Optional<Parcel> parcelOptional = parcelRepository.findById(parcelId);

		if (parcelOptional.isEmpty()) {
			throw new RuntimeException("Parcel not found");
		}

		List<Payment> payments = paymentRepository.findByParcelId(parcelId);

		if (payments.isEmpty()) {
			throw new RuntimeException("Payment not found for this parcel");
		}

		Parcel parcel = parcelOptional.get();

		// Use the first payment for the invoice
		Payment payment = payments.get(0);

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		Document document = new Document();

		PdfWriter.getInstance(document, outputStream);

		document.open();

		document.add(new Paragraph("SMART COURIER & LOGISTICS"));
		document.add(new Paragraph("================================"));

		document.add(new Paragraph("INVOICE"));
		document.add(new Paragraph(" "));

		document.add(new Paragraph("Invoice for Parcel: " + parcel.getTrackingId()));

		document.add(new Paragraph("Parcel ID: " + parcel.getId()));

		document.add(new Paragraph("Sender: " + parcel.getSenderName()));

		document.add(new Paragraph("Receiver: " + parcel.getReceiverName()));

		document.add(new Paragraph("Pickup Address: " + parcel.getPickupAddress()));

		document.add(new Paragraph("Delivery Address: " + parcel.getDeliveryAddress()));

		document.add(new Paragraph("Weight: " + parcel.getWeight() + " kg"));

		document.add(new Paragraph("Delivery Type: " + parcel.getDeliveryType()));

		document.add(new Paragraph("Delivery Charge: ₹" + parcel.getDeliveryCharge()));

		document.add(new Paragraph(" "));
		document.add(new Paragraph("PAYMENT DETAILS"));

		document.add(new Paragraph("Transaction ID: " + payment.getTransactionId()));

		document.add(new Paragraph("Payment Method: " + payment.getPaymentMethod()));

		document.add(new Paragraph("Payment Status: " + payment.getPaymentStatus()));

		document.add(new Paragraph("Payment Amount: ₹" + payment.getAmount()));

		document.add(new Paragraph("Payment Date: " + payment.getPaymentDate()));

		document.add(new Paragraph(" "));
		document.add(new Paragraph("Thank you for using Smart Courier!"));

		document.close();

		return outputStream.toByteArray();
	}
}