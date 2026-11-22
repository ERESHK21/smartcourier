package com.smartcourier.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcourier.entity.User;
import com.smartcourier.repository.UserRepository;

@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public User createUser(User user) {
		return userRepository.save(user);
	}

	public List<User> getAllUsers() {
		return userRepository.findAll();
	}

	public User getUserById(Long id) {
		return userRepository.findById(id).orElse(null);
	}

	public User getUserByEmail(String email) {
		return userRepository.findByEmail(email);
	}

}
