package com.second.bmsb.com.second.business_management_system_backend.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrderItemRequestDto(
    @NotNull @Positive Long productId,
    @NotNull @Positive Integer quantity
) {

	public Long productId() {
		return productId;
	}

	public Integer quantity() {
		return quantity;
	}
}