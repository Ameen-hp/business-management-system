package com.second.bmsb.com.second.business_management_system_backend.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DataAlreadyExist extends RuntimeException {

	private static final long serialVersionUID = 1L;
	private static final Logger logger = LoggerFactory.getLogger(DataAlreadyExist.class);
	
	public DataAlreadyExist(String message)
	{
		super(message);
		logger.error(message);
	}
}

