package com.smartcourier.service;

import org.springframework.stereotype.Service;

import com.smartcourier.dto.LoginRequest;
import com.smartcourier.dto.LoginResponse;
import com.smartcourier.entity.User;
import com.smartcourier.repository.UserRepository;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, JwtService jwtService) {

		this.userRepository = userRepository;
		this.jwtService = jwtService;
	}

	public LoginResponse login(LoginRequest request) {

		User user = userRepository.findByEmail(request.getEmail());

		if (user == null) {
			throw new RuntimeException("Invalid email or password");
		}

		if (!user.getPassword().equals(request.getPassword())) {
			throw new RuntimeException("Invalid email or password");
		}

		String token = jwtService.generateToken(user.getEmail());

		return new LoginResponse(user.getId(), user.getEmail(), user.getRole(), token);
	}
}