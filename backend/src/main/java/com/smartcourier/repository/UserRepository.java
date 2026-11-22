package com.smartcourier.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

	User findByEmail(String email);
}
