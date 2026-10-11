package com.second.bmsb.com.second.business_management_system_backend.exceptions;

public class ErrorResponse {

	private String message;

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
	
	public ErrorResponse(String message) {
        this.message = message;
    }
}
