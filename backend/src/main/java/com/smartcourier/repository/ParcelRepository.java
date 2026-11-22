package com.smartcourier.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcourier.entity.Parcel;

public interface ParcelRepository extends JpaRepository<Parcel, Long> {

	Optional<Parcel> findByTrackingId(String trackingId);

	List<Parcel> findByUserIdOrderByBookingDateDesc(Long userId);
}