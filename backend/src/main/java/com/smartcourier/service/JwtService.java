package com.smartcourier.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private final String SECRET_KEY = "mySecretKeyForSmartCourierSystem12345678901234567890";

	private SecretKey getSigningKey() {

		return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
	}

	public String generateToken(String email) {

		String token = Jwts.builder().subject(email).issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)).signWith(getSigningKey()).compact();

		// Temporary debugging
		System.out.println("GENERATED JWT: " + token);

		return token;
	}

	public String extractEmail(String token) {

		return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().getSubject();
	}
}