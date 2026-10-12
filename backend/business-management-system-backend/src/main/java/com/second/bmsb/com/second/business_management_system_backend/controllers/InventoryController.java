
package com.second.bmsb.com.second.business_management_system_backend.controllers;

import com.second.bmsb.com.second.business_management_system_backend.dtos.InventoryResponseDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.OpeningStockRequestDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.StockAdjustmentRequestDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.StockMovementResponseDto;
import com.second.bmsb.com.second.business_management_system_backend.services.InventoryService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Get all inventory records
    @GetMapping
    public ResponseEntity<List<InventoryResponseDto>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    // Get inventory for one product
    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponseDto> getInventoryByProductId(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                inventoryService.getInventoryByProductId(productId)
        );
    }

    // Add opening stock
    @PostMapping("/{productId}/opening-stock")
    public ResponseEntity<InventoryResponseDto> addOpeningStock(
            @PathVariable Long productId,
            @Valid @RequestBody OpeningStockRequestDto request) {

        InventoryResponseDto response =
                inventoryService.addOpeningStock(productId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Add or remove stock
    @PostMapping("/{productId}/adjustments")
    public ResponseEntity<InventoryResponseDto> adjustStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequestDto request) {

        return ResponseEntity.ok(
                inventoryService.adjustStock(productId, request)
        );
    }

    // Get stock movement history
    @GetMapping("/{productId}/movements")
    public ResponseEntity<List<StockMovementResponseDto>> getStockMovements(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                inventoryService.getStockMovements(productId)
        );
    }
}
