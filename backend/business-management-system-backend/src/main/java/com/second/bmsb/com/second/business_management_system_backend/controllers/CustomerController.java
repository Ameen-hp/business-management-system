
package com.second.bmsb.com.second.business_management_system_backend.controllers;

import com.second.bmsb.com.second.business_management_system_backend.dtos.CustomerRequestDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.CustomerResponseDto;
import com.second.bmsb.com.second.business_management_system_backend.services.CustomerService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // Create customer
    @PostMapping
    public ResponseEntity<CustomerResponseDto> createCustomer(
            @RequestBody CustomerRequestDto request) {

        CustomerResponseDto response =
                customerService.createCustomer(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all customers
    @GetMapping
    public ResponseEntity<List<CustomerResponseDto>> getAllCustomers() {

        List<CustomerResponseDto> customers =
                customerService.getAllCustomers();

        return ResponseEntity.ok(customers);
    }

    // Get customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDto> getCustomerById(
            @PathVariable Long id) {

        CustomerResponseDto response =
                customerService.getCustomerById(id);

        return ResponseEntity.ok(response);
    }

    // Update customer
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponseDto> updateCustomer(
            @PathVariable Long id,
            @RequestBody CustomerRequestDto request) {

        CustomerResponseDto response =
                customerService.updateCustomer(id, request);

        return ResponseEntity.ok(response);
    }

    // Delete customer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable Long id) {

        customerService.deleteCustomer(id);

        return ResponseEntity.noContent().build();
    }
}
