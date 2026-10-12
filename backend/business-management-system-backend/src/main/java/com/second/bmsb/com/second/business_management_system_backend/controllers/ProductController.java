package com.second.bmsb.com.second.business_management_system_backend.controllers;

import com.second.bmsb.com.second.business_management_system_backend.dtos.ProductRequestDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.ProductResponseDto;
import com.second.bmsb.com.second.business_management_system_backend.services.ProductService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private static final Logger log =
            LoggerFactory.getLogger(ProductController.class);

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Create product
    @PostMapping
    public ResponseEntity<ProductResponseDto> createProduct(
            @RequestBody ProductRequestDto request) {

        log.info("Request received to create product");

        ProductResponseDto response =
                productService.createProduct(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all products
    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts() {

        log.info("Request received to fetch all products");

        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getProductById(
            @PathVariable Long id) {

        log.info("Request received to fetch product ID: {}", id);

        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Update product details
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequestDto request) {

        log.info("Request received to update product ID: {}", id);

        return ResponseEntity.ok(
                productService.updateProduct(id, request));
    }

    // Change Active / Inactive status
    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductResponseDto> updateProductStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        log.info("Request received to change status for product ID: {}", id);

        return ResponseEntity.ok(
                productService.updateProductStatus(id, status));
    }

    // Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        log.info("Request received to delete product ID: {}", id);

        productService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }
    
    
//    delete all the products 

@DeleteMapping("/category/{categoryName}")
public ResponseEntity<Map<String, Long>> deleteProductsByCategory(
        @PathVariable String categoryName) {

    log.info(
            "Request received to delete products in category '{}'",
            categoryName
    );

    long deletedCount =
            productService.deleteProductsByCategory(categoryName);

    return ResponseEntity.ok(
            Map.of("deletedCount", deletedCount)
    );
}
}