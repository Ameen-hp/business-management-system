
package com.second.bmsb.com.second.business_management_system_backend.services;

import com.second.bmsb.com.second.business_management_system_backend.dtos.*;
import com.second.bmsb.com.second.business_management_system_backend.entities.*;
import com.second.bmsb.com.second.business_management_system_backend.entities.OrderEntity.OrderStatus;
import com.second.bmsb.com.second.business_management_system_backend.repositories.OrderRepository;
import com.second.bmsb.com.second.business_management_system_backend.repositories.CustomerRepository;
import com.second.bmsb.com.second.business_management_system_backend.repositories.ProductRepository;
import com.second.bmsb.com.second.business_management_system_backend.repositories.InventoryRepository;
import com.second.bmsb.com.second.business_management_system_backend.repositories.StockMovementRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            StockMovementRepository stockMovementRepository) {

        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    // Create order, deduct inventory, and record SALE movements.
    @Transactional
    public OrderResponseDto createOrder(OrderRequestDto request) {

        CustomerEntity customer = customerRepository
                .findById(request.customerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Customer not found"));

        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "An order must contain at least one item");
        }

        OrderEntity order = new OrderEntity();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomerId(customer.getId());
        order.setStatus(OrderStatus.Pending);

        BigDecimal total = BigDecimal.ZERO;
        Set<Long> productIds = new HashSet<>();

        for (OrderItemRequestDto requestItem : request.items()) {

            if (requestItem.productId() == null
                    || requestItem.quantity() == null
                    || requestItem.quantity() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Product ID and a positive quantity are required");
            }

            if (!productIds.add(requestItem.productId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A product can only appear once in an order. Combine duplicate quantities.");
            }

            ProductEntity product = productRepository
                    .findById(requestItem.productId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Product not found"));

            if (!"Active".equalsIgnoreCase(product.getStatus())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Product is inactive: " + product.getName());
            }

            if (product.getPrice() == null
                    || product.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Product has an invalid price: " + product.getName());
            }

            // Lock the inventory row before checking available stock.
            InventoryEntity inventory = inventoryRepository
                    .findByProductIdForUpdate(product.getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Opening stock has not been recorded for product: "
                                    + product.getName()));

            int before = inventory.getQuantity();
            int quantity = requestItem.quantity();

            if (quantity > before) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for " + product.getName()
                                + ". Available: " + before
                                + ", requested: " + quantity);
            }

            int after = before - quantity;

            inventory.setQuantity(after);
            inventoryRepository.save(inventory);

            OrderItemEntity item = new OrderItemEntity();
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setSku(product.getSku());
            item.setQuantity(quantity);
            item.setUnitPrice(product.getPrice());

            BigDecimal lineTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(quantity));

            item.setLineTotal(lineTotal);
            order.addItem(item);

            total = total.add(lineTotal);

            // Keep the stock movement history consistent with inventory.
            StockMovementEntity movement = new StockMovementEntity();
            movement.setProduct(product);
            movement.setMovementType("SALE");
            movement.setQuantity(quantity);
            movement.setQuantityBefore(before);
            movement.setQuantityAfter(after);
            movement.setReason(
                    "Order " + order.getOrderNumber());

            stockMovementRepository.save(movement);
        }

        order.setTotalAmount(total);

        // Cascade saves all order items with the order.
        OrderEntity savedOrder = orderRepository.saveAndFlush(order);

        return toResponse(
                savedOrder,
                customer.getFullName(),
                customer.getEmail());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc()
                .stream()
                .map(this::toResponseWithCustomer)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Long id) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        return toResponseWithCustomer(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getCustomerOrders(Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Customer not found");
        }

        return orderRepository
                .findByCustomerIdOrderByOrderDateDesc(customerId)
                .stream()
                .map(this::toResponseWithCustomer)
                .toList();
    }

    // Update status and restore stock when an eligible order is cancelled.
    @Transactional
    public OrderResponseDto updateOrderStatus(
            Long id, OrderStatus newStatus) {

        if (newStatus == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Order status is required");
        }

        // Lock the order to prevent concurrent cancellation/restoration.
        OrderEntity order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        OrderStatus current = order.getStatus();

        if (!isAllowedTransition(current, newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Order cannot move from " + current + " to " + newStatus);
        }

        // Restore stock only on the first transition to Cancelled.
        if (current != OrderStatus.Cancelled
                && newStatus == OrderStatus.Cancelled) {
            restoreStockForCancelledOrder(order);
        }

        order.setStatus(newStatus);

        OrderEntity savedOrder = orderRepository.saveAndFlush(order);

        return toResponseWithCustomer(savedOrder);
    }

    private void restoreStockForCancelledOrder(OrderEntity order) {

        for (OrderItemEntity item : order.getItems()) {

            InventoryEntity inventory = inventoryRepository
                    .findByProductIdForUpdate(item.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Cannot restore stock: inventory is missing for product "
                                    + item.getProductName()));

            int before = inventory.getQuantity();
            int quantity = item.getQuantity();

            final int after;

            try {
                after = Math.addExact(before, quantity);
            } catch (ArithmeticException ex) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Stock quantity overflow for product: "
                                + item.getProductName());
            }

            inventory.setQuantity(after);
            inventoryRepository.save(inventory);

            StockMovementEntity movement = new StockMovementEntity();
            movement.setProduct(inventory.getProduct());
            movement.setMovementType("RETURN");
            movement.setQuantity(quantity);
            movement.setQuantityBefore(before);
            movement.setQuantityAfter(after);
            movement.setReason(
                    "Cancellation of order " + order.getOrderNumber());

            stockMovementRepository.save(movement);
        }
    }

    private boolean isAllowedTransition(
            OrderStatus current, OrderStatus next) {

        if (current == next) {
            return true;
        }

        return switch (current) {
            case Pending ->
                    next == OrderStatus.Confirmed
                            || next == OrderStatus.Cancelled;

            case Confirmed ->
                    next == OrderStatus.Processing
                            || next == OrderStatus.Cancelled;

            case Processing ->
                    next == OrderStatus.Shipped
                            || next == OrderStatus.Cancelled;

            case Shipped ->
                    next == OrderStatus.Completed;

            case Completed, Cancelled -> false;
        };
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase(Locale.ROOT);
    }

    private OrderResponseDto toResponseWithCustomer(OrderEntity order) {

        CustomerEntity customer = customerRepository
                .findById(order.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order customer not found"));

        return toResponse(
                order,
                customer.getFullName(),
                customer.getEmail());
    }

    private OrderResponseDto toResponse(
            OrderEntity order,
            String customerName,
            String customerEmail) {

        List<OrderItemResponseDto> items = order.getItems()
                .stream()
                .map(item -> new OrderItemResponseDto(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getSku(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getLineTotal()))
                .toList();

        return new OrderResponseDto(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerId(),
                customerName,
                customerEmail,
                order.getOrderDate(),
                items,
                order.getStatus(),
                order.getTotalAmount());
    }
}
