
package com.second.bmsb.com.second.business_management_system_backend.repositories;

import com.second.bmsb.com.second.business_management_system_backend.entities.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository
        extends JpaRepository<CustomerEntity, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<CustomerEntity> findByEmailIgnoreCase(String email);
}
