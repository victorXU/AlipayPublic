package com.victor.service;

import com.victor.pojo.AlipayOrderEntity;

import java.util.Map;

public interface ZshInterfacePayService {

	/**
	 * 
	 * 执行<p>
	 * [功能详细描述]<p>
	 * @author victor
	 * @version 1.0, 2015-7-16
	 * @see
	 * @since V1.0
	 * @param entity
	 * @return
	 */
	public String execute(Map<String, String> requestMap, AlipayOrderEntity entity);
	
	
}