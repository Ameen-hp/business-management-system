
package com.second.bmsb.com.second.business_management_system_backend.repositories;

import com.second.bmsb.com.second.business_management_system_backend.entities.InventoryEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository
        extends JpaRepository<InventoryEntity, Long> {

    boolean existsByProduct_Id(Long productId);

    Optional<InventoryEntity> findByProduct_Id(Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT i FROM InventoryEntity i
        JOIN FETCH i.product
        WHERE i.product.id = :productId
        """)
    Optional<InventoryEntity> findByProductIdForUpdate(
            @Param("productId") Long productId
    );

    @Query("""
        SELECT i FROM InventoryEntity i
        JOIN FETCH i.product
        ORDER BY i.id DESC
        """)
    List<InventoryEntity> findAllWithProduct();
}
