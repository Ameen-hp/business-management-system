package com.second.bmsb.com.second.business_management_system_backend.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DataReadException extends RuntimeException{
	
	private static final long serialVersionUID = 1L;
	private static final Logger logger = LoggerFactory.getLogger(DataSaveException.class);
	
	public DataReadException(String message)
	{
		super(message);
		logger.error(message);
	}

}
