package com.second.bmsb.com.second.business_management_system_backend.services;

import com.second.bmsb.com.second.business_management_system_backend.dtos.ProductRequestDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.ProductResponseDto;
import com.second.bmsb.com.second.business_management_system_backend.entities.ProductEntity;
import com.second.bmsb.com.second.business_management_system_backend.exceptions.*;
import com.second.bmsb.com.second.business_management_system_backend.repositories.ProductRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private static final Logger log =
            LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Create product
    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto request) {

        validateRequest(request, true);

        try {
            String sku = request.getSku().trim();

            if (productRepository.existsBySkuIgnoreCase(sku)) {
                throw new DataAlreadyExist(
                        "Product with this SKU already exists");
            }

            ProductEntity product = new ProductEntity();

            product.setName(request.getName().trim());
            product.setSku(sku);
            product.setCategory(request.getCategory().trim());
            product.setPrice(request.getPrice());
            product.setDescription(normalizeDescription(request.getDescription()));

            // New products are Active unless a valid status is supplied.
            product.setStatus(
                    request.getStatus() == null
                            || request.getStatus().isBlank()
                            ? "Active"
                            : normalizeStatus(request.getStatus())
            );

            ProductEntity savedProduct = productRepository.save(product);

            log.info("Product created successfully. ID: {}", savedProduct.getId());

            return mapToResponse(savedProduct);

        } catch (InvalidData | DataAlreadyExist ex) {
            throw ex;
        } catch (DataAccessException ex) {
            log.error("Database error while creating product", ex);
            throw new DataSaveException("Unable to save product");
        }
    }

    // Get all products
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllProducts() {
        try {
            return productRepository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .toList();

        } catch (DataAccessException ex) {
            log.error("Database error while fetching products", ex);
            throw new DataReadException("Unable to retrieve products");
        }
    }

    // Get product by ID
    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long id) {

        validateId(id);

        try {
            ProductEntity product = productRepository.findById(id)
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Product not found with ID: " + id));

            return mapToResponse(product);

        } catch (InvalidData | BusinessException ex) {
            throw ex;
        } catch (DataAccessException ex) {
            log.error("Database error while fetching product {}", id, ex);
            throw new DataReadException("Unable to retrieve product");
        }
    }

    // Update product
    @Transactional
    public ProductResponseDto updateProduct(
            Long id,
            ProductRequestDto request) {

        validateId(id);
        validateRequest(request, false);

        try {
            ProductEntity product = productRepository.findById(id)
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Product not found with ID: " + id));

            String sku = request.getSku().trim();

            if (productRepository.existsBySkuIgnoreCaseAndIdNot(sku, id)) {
                throw new DataAlreadyExist(
                        "Another product already uses this SKU");
            }

            product.setName(request.getName().trim());
            product.setSku(sku);
            product.setCategory(request.getCategory().trim());
            product.setPrice(request.getPrice());
            product.setDescription(normalizeDescription(request.getDescription()));

            if (request.getStatus() != null
                    && !request.getStatus().isBlank()) {
                product.setStatus(normalizeStatus(request.getStatus()));
            }

            ProductEntity updatedProduct = productRepository.save(product);

            log.info("Product updated successfully. ID: {}", id);

            return mapToResponse(updatedProduct);

        } catch (InvalidData | DataAlreadyExist | BusinessException ex) {
            throw ex;
        } catch (DataAccessException ex) {
            log.error("Database error while updating product {}", id, ex);
            throw new DataSaveException("Unable to update product");
        }
    }

    // Change product status
    @Transactional
    public ProductResponseDto updateProductStatus(
            Long id,
            String status) {

        validateId(id);

        String normalizedStatus = normalizeStatus(status);

        try {
            ProductEntity product = productRepository.findById(id)
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Product not found with ID: " + id));

            product.setStatus(normalizedStatus);

            ProductEntity updatedProduct = productRepository.save(product);

            log.info("Product status updated. ID: {}, Status: {}",
                    id, normalizedStatus);

            return mapToResponse(updatedProduct);

        } catch (InvalidData | BusinessException ex) {
            throw ex;
        } catch (DataAccessException ex) {
            log.error("Database error while changing product status {}", id, ex);
            throw new DataSaveException("Unable to update product status");
        }
    }

    // Delete product
    @Transactional
    public void deleteProduct(Long id) {

        validateId(id);

        try {
            ProductEntity product = productRepository.findById(id)
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Product not found with ID: " + id));

            productRepository.delete(product);

            log.info("Product deleted successfully. ID: {}", id);

        } catch (InvalidData | BusinessException ex) {
            throw ex;
        } catch (DataAccessException ex) {
            log.error("Database error while deleting product {}", id, ex);
            throw new DataSaveException("Unable to delete product");
        }
    }

    // Request validation
    private void validateRequest(
            ProductRequestDto request,
            boolean creating) {

        if (request == null) {
            throw new InvalidData("Product request cannot be null");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new InvalidData("Product name is required");
        }

        if (request.getName().trim().length() > 150) {
            throw new InvalidData("Product name cannot exceed 150 characters");
        }

        if (request.getSku() == null || request.getSku().isBlank()) {
            throw new InvalidData("Product SKU is required");
        }

        if (request.getSku().trim().length() > 50) {
            throw new InvalidData("Product SKU cannot exceed 50 characters");
        }

        if (request.getCategory() == null
                || request.getCategory().isBlank()) {
            throw new InvalidData("Product category is required");
        }

        if (request.getCategory().trim().length() > 100) {
            throw new InvalidData("Product category cannot exceed 100 characters");
        }

        BigDecimal price = request.getPrice();

        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidData("Product price must be greater than zero");
        }

        if (price.scale() > 2
                || price.precision() > 12) {
            throw new InvalidData(
                    "Product price must have at most 10 integer digits and 2 decimal places");
        }

        if (request.getDescription() != null
                && request.getDescription().length() > 1000) {
            throw new InvalidData(
                    "Product description cannot exceed 1000 characters");
        }

        if (request.getStatus() != null
                && !request.getStatus().isBlank()) {
            normalizeStatus(request.getStatus());
        }
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new InvalidData("Invalid product ID");
        }
    }

    
    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new InvalidData("Product status is required");
        }

        String normalized = status.trim();

        if ("Active".equalsIgnoreCase(normalized)) {
            return "Active";
        }

        if ("Inactive".equalsIgnoreCase(normalized)) {
            return "Inactive";
        }

        throw new InvalidData("Product status must be Active or Inactive");
    }

    private String normalizeDescription(String description) {
        return description == null || description.isBlank()
                ? null
                : description.trim();
    }



@Transactional
public long deleteProductsByCategory(String categoryName) {
    if (categoryName == null || categoryName.isBlank()) {
        throw new InvalidData("Category name is required");
    }

    String normalizedCategory = categoryName.trim();

    try {
        List<ProductEntity> products =
                productRepository.findByCategoryIgnoreCase(normalizedCategory);

        long deletedCount = products.size();

        if (deletedCount > 0) {
            productRepository.deleteAll(products);
        }

        log.info(
                "Deleted {} product(s) from category '{}'",
                deletedCount,
                normalizedCategory
        );

        return deletedCount;
    } catch (DataAccessException ex) {
        log.error(
                "Failed to delete products for category '{}'",
                normalizedCategory,
                ex
        );

        throw new DataSaveException(
                "Unable to delete products for this category"
        );
    }
}

    private ProductResponseDto mapToResponse(ProductEntity product) {
        ProductResponseDto response = new ProductResponseDto();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setSku(product.getSku());
        response.setCategory(product.getCategory());
        response.setPrice(product.getPrice());
        response.setDescription(product.getDescription());
        response.setStatus(product.getStatus());
        response.setCreatedOn(product.getCreatedOn());
        response.setUpdatedOn(product.getUpdatedOn());

        return response;
    }
}