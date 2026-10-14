package com.second.bmsb.com.second.business_management_system_backend.dtos;

import java.math.BigDecimal;

public record OrderItemResponseDto(
    Long id,
    Long productId,
    String productName,
    String sku,
    Integer quantity,
    BigDecimal unitPrice,
    BigDecimal lineTotal
) {
}