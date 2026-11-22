package com.smartcourier.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.entity.Parcel;
import com.smartcourier.entity.User;
import com.smartcourier.repository.ParcelRepository;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.InvoiceService;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

	private final InvoiceService invoiceService;
	private final UserRepository userRepository;
	private final ParcelRepository parcelRepository;

	public InvoiceController(InvoiceService invoiceService, UserRepository userRepository,
			ParcelRepository parcelRepository) {

		this.invoiceService = invoiceService;
		this.userRepository = userRepository;
		this.parcelRepository = parcelRepository;
	}

	@GetMapping("/{parcelId}")
	public ResponseEntity<byte[]> generateInvoice(@PathVariable Long parcelId, Authentication authentication) {

		User user = getLoggedInUser(authentication);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		Parcel parcel = parcelRepository.findById(parcelId).orElse(null);

		if (parcel == null) {
			return ResponseEntity.notFound().build();
		}

		String role = user.getRole().trim().toUpperCase();

		// CUSTOMER can generate invoice only for their own parcel
		if (role.equals("CUSTOMER") && !user.getId().equals(parcel.getUserId())) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		try {

			byte[] pdf = invoiceService.generateInvoice(parcelId);

			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + parcelId + ".pdf")
					.contentType(MediaType.APPLICATION_PDF).body(pdf);

		} catch (RuntimeException e) {

			return ResponseEntity.notFound().build();

		} catch (Exception e) {

			return ResponseEntity.internalServerError().build();
		}
	}

	private User getLoggedInUser(Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {
			return null;
		}

		String email = authentication.getName();

		return userRepository.findByEmail(email);
	}
}