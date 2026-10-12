package com.second.bmsb.com.second.business_management_system_backend.repositories;

import com.second.bmsb.com.second.business_management_system_backend.entities.ProductEntity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository
        extends JpaRepository<ProductEntity, Long> {

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);
    
    List<ProductEntity> findByCategoryIgnoreCase(String category);

    long countByCategoryIgnoreCase(String category);
}	