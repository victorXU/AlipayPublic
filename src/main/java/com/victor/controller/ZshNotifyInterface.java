package com.victor.controller;

import com.victor.service.CreateAndPayService;
import com.victor.util.LogUtil;
import com.victor.util.RequestUtil;
import com.zsh.entity.PayParameter;
import com.zsh.mapper.CommonMapper;
import com.zsh.util.*;
import org.apache.commons.httpclient.HttpClient;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.util.HashMap;
import java.util.Map;

/**
 * [一句话功能简述]<p>
 * [功能详细描述]<p>
 * @author victor
 * @version 1.0, 2015-7-22
 * @see
 * @since V1.0
 */
@Controller
@RequestMapping("/notify")
public class ZshNotifyInterface {

	@Resource
	CreateAndPayService createAndPayService;
	@RequestMapping("/alipayNotify")
	public String alipayNotify(HttpServletRequest request)  {
		LogUtil.debug("【支付宝回调】alipayNotify begin：request=" + request);
		String response="";
		try {
			Map<String, String> requestMap = RequestUtil.getRequestParams(request);
			response = createAndPayService.notifyService(requestMap);
		}catch (Exception e){
			LogUtil.debug("【支付宝回调】alipayNotify Exception=" + e.getMessage());
			e.printStackTrace();
		}
		LogUtil.debug("【支付宝回调】alipayNotify end：response=" + response);
		return response;
	}
	
}
