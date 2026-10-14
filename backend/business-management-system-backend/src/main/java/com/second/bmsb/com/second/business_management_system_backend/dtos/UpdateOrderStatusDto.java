package com.second.bmsb.com.second.business_management_system_backend.dtos;

import com.second.bmsb.com.second.business_management_system_backend.entities.OrderEntity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusDto(
    @NotNull OrderStatus status
) {

	public OrderStatus status() {
		return status;
	}
}