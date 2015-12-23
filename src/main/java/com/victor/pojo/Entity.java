package com.victor.pojo;

import com.alibaba.fastjson.JSON;

import java.io.Serializable;

/**
 * Created by Administrator on 2015-11-15.
 */
public class Entity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Override
	public String toString() {
		
		return JSON.toJSONString(this);
		
	}

	
}
