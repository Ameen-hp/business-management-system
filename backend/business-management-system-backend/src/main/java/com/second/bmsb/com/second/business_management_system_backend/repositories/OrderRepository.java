package com.second.bmsb.com.second.business_management_system_backend.repositories;

import com.second.bmsb.com.second.business_management_system_backend.entities.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    Optional<OrderEntity> findByOrderNumber(String orderNumber);

    List<OrderEntity> findAllByOrderByOrderDateDesc();

    List<OrderEntity> findByCustomerIdOrderByOrderDateDesc(Long customerId);

    boolean existsByOrderNumber(String orderNumber);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM OrderEntity o WHERE o.id = :id")
    Optional<OrderEntity> findByIdForUpdate(@Param("id") Long id);
}