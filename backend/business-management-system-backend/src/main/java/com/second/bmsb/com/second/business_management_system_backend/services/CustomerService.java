package com.second.bmsb.com.second.business_management_system_backend.services;

import com.second.bmsb.com.second.business_management_system_backend.dtos.CustomerRequestDto;
import com.second.bmsb.com.second.business_management_system_backend.dtos.CustomerResponseDto;
import com.second.bmsb.com.second.business_management_system_backend.entities.CustomerEntity;
import com.second.bmsb.com.second.business_management_system_backend.exceptions.*;
import com.second.bmsb.com.second.business_management_system_backend.repositories.CustomerRepository;
import lombok.Builder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private static final Logger log =
            LoggerFactory.getLogger(CustomerService.class);

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Create customer
    @Transactional
    public CustomerResponseDto createCustomer(
            CustomerRequestDto request) {

        if (request == null) {
            throw new InvalidData("Customer request cannot be null");
        }

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {
            throw new InvalidData("Customer email is required");
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {
            throw new InvalidData("Customer password is required");
        }

        try {
            String email = request.getEmail().trim();

            if (customerRepository.existsByEmailIgnoreCase(email)) {
                throw new DataAlreadyExist(
                        "Customer with this email already exists");
            }

            CustomerEntity customer = new CustomerEntity();
            customer.setFullName(request.getFullName());
            customer.setEmail(email);
            customer.setPhone(request.getPhone());
            customer.setAddress(request.getAddress());
            customer.setPassword(
                    passwordEncoder.encode(request.getPassword()));
            customer.setActive(true);

            CustomerEntity savedCustomer =
                    customerRepository.save(customer);

            log.info("Customer created successfully. ID: {}",
                    savedCustomer.getId());

            return mapToResponse(savedCustomer);

        } catch (DataAlreadyExist | InvalidData ex) {
            throw ex;
        } catch (DataAccessException ex) {
            log.error("Database error while creating customer", ex);
            throw new DataSaveException("Unable to save customer");
        }
    }

    // Get all customers
    @Transactional(readOnly = true)
    public List<CustomerResponseDto> getAllCustomers() {
        try {
            return customerRepository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .toList();

        } catch (DataAccessException ex) {
            log.error("Database error while fetching customers", ex);
            throw new DataReadException("Unable to retrieve customers");
        }
    }

    // Get customer by ID
    @Transactional(readOnly = true)
    public CustomerResponseDto getCustomerById(Long id) {

        if (id == null || id <= 0) {
            throw new InvalidData("Invalid customer ID");
        }

        try {
            CustomerEntity customer = customerRepository.findById(id)
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Customer not found with ID: " + id));

            return mapToResponse(customer);

        } catch (BusinessException | InvalidData ex) {
            throw ex;
        } catch (DataAccessException ex) {
            log.error("Database error while fetching customer {}", id, ex);
            throw new DataReadException("Unable to retrieve customer");
        }
    }

    // Update customer
    @Transactional
    public CustomerResponseDto updateCustomer(
            Long id,
            CustomerRequestDto request) {

        if (id == null || id <= 0) {
            throw new InvalidData("Invalid customer ID");
        }

        if (request == null) {
            throw new InvalidData("Customer request cannot be null");
        }

        try {
            CustomerEntity customer = customerRepository.findById(id)
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Customer not found with ID: " + id));

            if (request.getEmail() != null
                    && !request.getEmail().isBlank()) {

                String email = request.getEmail().trim();

                if (!email.equalsIgnoreCase(customer.getEmail())
                        && customerRepository
                        .existsByEmailIgnoreCase(email)) {
                    throw new DataAlreadyExist(
                            "Another customer already uses this email");
                }

                customer.setEmail(email);
            }

            if (request.getFullName() != null) {
                customer.setFullName(request.getFullName());
            }

            if (request.getPhone() != null) {
                customer.setPhone(request.getPhone());
            }

            if (request.getAddress() != null) {
                customer.setAddress(request.getAddress());
            }

            // Update password only when a new password is provided
            if (request.getPassword() != null
                    && !request.getPassword().isBlank()) {
                customer.setPassword(
                        passwordEncoder.encode(request.getPassword()));
            }

            CustomerEntity updatedCustomer =
                    customerRepository.save(customer);

            log.info("Customer updated successfully. ID: {}", id);

            return mapToResponse(updatedCustomer);

        } catch (DataAlreadyExist | InvalidData | BusinessException ex) {
            throw ex;
        } catch (DataAccessException ex) {
            log.error("Database error while updating customer {}", id, ex);
            throw new DataSaveException("Unable to update customer");
        }
    }

    // Delete customer
    @Transactional
    public void deleteCustomer(Long id) {

        if (id == null || id <= 0) {
            throw new InvalidData("Invalid customer ID");
        }

        try {
            CustomerEntity customer = customerRepository.findById(id)
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Customer not found with ID: " + id));

            customerRepository.delete(customer);

            log.info("Customer deleted successfully. ID: {}", id);

        } catch (BusinessException | InvalidData ex) {
            throw ex;
        } catch (DataAccessException ex) {
            log.error("Database error while deleting customer {}", id, ex);
            throw new DataSaveException("Unable to delete customer");
        }
    }

    private CustomerResponseDto mapToResponse(CustomerEntity customer) {
        CustomerResponseDto response = new CustomerResponseDto();

        response.setId(customer.getId());
        response.setFullName(customer.getFullName());
        response.setEmail(customer.getEmail());
        response.setPhone(customer.getPhone());
        response.setAddress(customer.getAddress());
        response.setActive(customer.getActive());
        response.setCreatedOn(customer.getCreatedOn());
        response.setUpdatedOn(customer.getUpdatedOn());

        return response;
    }
}
