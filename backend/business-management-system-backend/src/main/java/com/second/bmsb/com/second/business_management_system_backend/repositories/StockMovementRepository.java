
package com.second.bmsb.com.second.business_management_system_backend.repositories;

import com.second.bmsb.com.second.business_management_system_backend.entities.StockMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository
        extends JpaRepository<StockMovementEntity, Long> {

    List<StockMovementEntity>
    findByProduct_IdOrderByCreatedOnDesc(Long productId);
}
