package com.smartcourier.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.Hub;

public interface HubRepository extends JpaRepository<Hub, Long> {

	List<Hub> findByCity(String city);

	List<Hub> findByStatus(String status);
}