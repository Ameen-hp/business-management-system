
package com.second.bmsb.com.second.business_management_system_backend.services;

import com.second.bmsb.com.second.business_management_system_backend.dtos.InventoryResponseDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.OpeningStockRequestDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.StockAdjustmentRequestDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.StockMovementResponseDto;
import com.second.bmsb.com.second.business_management_system_backend.entities.InventoryEntity;
import com.second.bmsb.com.second.business_management_system_backend.entities.ProductEntity;
import com.second.bmsb.com.second.business_management_system_backend.entities.StockMovementEntity;
import com.second.bmsb.com.second.business_management_system_backend.repositories.InventoryRepository;
import com.second.bmsb.com.second.business_management_system_backend.repositories.ProductRepository;
import com.second.bmsb.com.second.business_management_system_backend.repositories.StockMovementRepository;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    public InventoryService(
            InventoryRepository inventoryRepository,
            ProductRepository productRepository,
            StockMovementRepository stockMovementRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    // Get all inventory records
    @Transactional
    public List<InventoryResponseDto> getAllInventory() {
        return inventoryRepository.findAllWithProduct()
                .stream()
                .map(this::mapInventory)
                .toList();
    }

    // Get inventory for one product
    @Transactional
    public InventoryResponseDto getInventoryByProductId(Long productId) {
        InventoryEntity inventory = inventoryRepository
                .findByProduct_Id(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Inventory not found for product ID: " + productId
                ));

        return mapInventory(inventory);
    }

    // Add opening stock once for a product
    @Transactional
    public InventoryResponseDto addOpeningStock(
            Long productId,
            OpeningStockRequestDto request) {

        if (inventoryRepository.existsByProduct_Id(productId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Opening stock has already been recorded for this product"
            );
        }

        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found with ID: " + productId
                ));

        InventoryEntity inventory = new InventoryEntity();
        inventory.setProduct(product);
        inventory.setQuantity(request.getQuantity());
        inventory.setUnitCost(request.getUnitCost());
        inventory.setReorderLevel(request.getReorderLevel());

        inventoryRepository.saveAndFlush(inventory);

        saveMovement(
                product,
                "OPENING",
                request.getQuantity(),
                0,
                request.getQuantity(),
                request.getReason()
        );

        return mapInventory(inventory);
    }

    // Add or remove stock
    @Transactional
    public InventoryResponseDto adjustStock(
            Long productId,
            StockAdjustmentRequestDto request) {

        InventoryEntity inventory = inventoryRepository
                .findByProductIdForUpdate(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Inventory not found. Add opening stock first."
                ));

        String type = request.getType()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!type.equals("ADD") && !type.equals("REMOVE")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Adjustment type must be ADD or REMOVE"
            );
        }

        int before = inventory.getQuantity();
        int amount = request.getQuantity();
        int after;

        if (type.equals("ADD")) {
            after = Math.addExact(before, amount);
        } else {
            if (amount > before) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cannot remove more stock than available"
                );
            }

            after = before - amount;
        }

        inventory.setQuantity(after);
        inventoryRepository.saveAndFlush(inventory);

        saveMovement(
                inventory.getProduct(),
                type,
                amount,
                before,
                after,
                request.getReason()
        );

        return mapInventory(inventory);
    }

    // Get stock movement history for a product
    @Transactional
    public List<StockMovementResponseDto> getStockMovements(Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found with ID: " + productId
            );
        }

        return stockMovementRepository
                .findByProduct_IdOrderByCreatedOnDesc(productId)
                .stream()
                .map(this::mapMovement)
                .toList();
    }

    private void saveMovement(
            ProductEntity product,
            String type,
            int quantity,
            int before,
            int after,
            String reason) {

        StockMovementEntity movement = new StockMovementEntity();

        movement.setProduct(product);
        movement.setMovementType(type);
        movement.setQuantity(quantity);
        movement.setQuantityBefore(before);
        movement.setQuantityAfter(after);
        movement.setReason(reason.trim());

        stockMovementRepository.save(movement);
    }

    private InventoryResponseDto mapInventory(InventoryEntity inventory) {

        ProductEntity product = inventory.getProduct();

        InventoryResponseDto dto = new InventoryResponseDto();

        dto.setId(inventory.getId());
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setSku(product.getSku());
        dto.setCategory(product.getCategory());
        dto.setSellingPrice(product.getPrice());
        dto.setProductStatus(product.getStatus());

        dto.setQuantity(inventory.getQuantity());
        dto.setReorderLevel(inventory.getReorderLevel());
        dto.setUnitCost(inventory.getUnitCost());

        BigDecimal stockValue = inventory.getUnitCost()
                .multiply(BigDecimal.valueOf(inventory.getQuantity()));

        dto.setStockValue(stockValue);

        int quantity = inventory.getQuantity();
        int reorderLevel = inventory.getReorderLevel();

        String status;

        if (quantity == 0) {
            status = "Out of Stock";
        } else if (quantity <= reorderLevel) {
            status = "Low Stock";
        } else {
            status = "In Stock";
        }

        dto.setStockStatus(status);
        dto.setCreatedOn(inventory.getCreatedOn());
        dto.setUpdatedOn(inventory.getUpdatedOn());

        return dto;
    }

    private StockMovementResponseDto mapMovement(
            StockMovementEntity movement) {

        StockMovementResponseDto dto = new StockMovementResponseDto();
        ProductEntity product = movement.getProduct();

        dto.setId(movement.getId());
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setSku(product.getSku());

        dto.setMovementType(movement.getMovementType());
        dto.setQuantity(movement.getQuantity());
        dto.setQuantityBefore(movement.getQuantityBefore());
        dto.setQuantityAfter(movement.getQuantityAfter());
        dto.setReason(movement.getReason());
        dto.setCreatedOn(movement.getCreatedOn());

        return dto;
    }
}
