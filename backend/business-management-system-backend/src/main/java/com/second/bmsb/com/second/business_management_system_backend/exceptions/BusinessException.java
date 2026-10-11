package com.second.bmsb.com.second.business_management_system_backend.exceptions;

/**
 * Thrown for known/expected business errors, e.g., duplicate role or user not found.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
