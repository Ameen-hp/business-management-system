package com.second.bmsb.com.second.business_management_system_backend.controllers;

import com.second.bmsb.com.second.business_management_system_backend.dtos.*;
import com.second.bmsb.com.second.business_management_system_backend.entities.OrderEntity.OrderStatus;
import com.second.bmsb.com.second.business_management_system_backend.services.OrderService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Create an order.
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @Valid @RequestBody OrderRequestDto request) {
    	 System.out.println("got order "+(request));

        OrderResponseDto response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all orders for the admin.
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Get one order.
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrderById(
            @PathVariable Long id) {

        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // Get orders for a particular customer.
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponseDto>> getCustomerOrders(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                orderService.getCustomerOrders(customerId));
    }

    // Update order status.
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusDto request) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, request.status()));
    }
}