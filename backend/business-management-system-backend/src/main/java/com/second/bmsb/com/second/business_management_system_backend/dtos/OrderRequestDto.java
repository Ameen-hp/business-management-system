package com.second.bmsb.com.second.business_management_system_backend.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record OrderRequestDto(
    @NotNull @Positive Long customerId,
    @NotEmpty List<@Valid OrderItemRequestDto> items
) {

	public Long customerId() {
		return customerId;
	}

	public List<OrderItemRequestDto> items() {
		return items;
	}
}