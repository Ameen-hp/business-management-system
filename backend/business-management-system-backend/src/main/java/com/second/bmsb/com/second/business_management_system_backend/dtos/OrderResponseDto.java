package com.second.bmsb.com.second.business_management_system_backend.dtos;

import com.second.bmsb.com.second.business_management_system_backend.entities.OrderEntity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponseDto(
    Long id,
    String orderNumber,
    Long customerId,
    String customerName,
    String customerEmail,
    LocalDateTime orderDate,
    List<OrderItemResponseDto> items,
    OrderStatus status,
    BigDecimal totalAmount
) {

	public Long id() {
		return id;
	}

	public String orderNumber() {
		return orderNumber;
	}

	public Long customerId() {
		return customerId;
	}

	public String customerName() {
		return customerName;
	}

	public String customerEmail() {
		return customerEmail;
	}

	public LocalDateTime orderDate() {
		return orderDate;
	}

	public List<OrderItemResponseDto> items() {
		return items;
	}

	public OrderStatus status() {
		return status;
	}

	public BigDecimal totalAmount() {
		return totalAmount;
	}
}