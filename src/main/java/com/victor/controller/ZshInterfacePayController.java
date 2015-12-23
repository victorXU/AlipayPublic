package com.victor.controller;

import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.CommonService;
import com.victor.service.ZshInterfacePayService;
import com.victor.util.*;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.util.Map;



/**
 * 
 * 支付宝支付入口
 * <p>
 * [功能详细描述]
 * <p>
 * 
 * @author victor
 * @version 1.0, 2015-7-15
 * @see
 * @since V1.0
 */
@Controller
@RequestMapping("/zsh")
public class ZshInterfacePayController {
	@Resource
	private CommonService commonService;

	@Resource
	private UigXmlMgr uigXmlMgr;

	private ZshInterfacePayService service;// 接口

	@RequestMapping(value = "/interface", produces = "text/html;charset=UTF-8")
	@ResponseBody
	public String unifiedOrder(HttpServletRequest request, Model model) {
		AlipayOrderEntity entity = new AlipayOrderEntity();
		try {
			request.setCharacterEncoding(ZshConfig.UTF_8);
			LogUtil.debug("【调用支付宝接口】开始，"+request.getRemoteHost() + "发送的URL请求串内容是：" + request.getRequestURI() + "?" + request.getQueryString());

			Map<String, String> requestMap = RequestUtil.getRequestParams(request);
			// 解析串的合法性。
			if (!commonService.validateRequest(requestMap, entity)) {
				return entity.getValidateResult();
			}

			String result = doAction(requestMap, entity);
			return result;
		} catch (UnsupportedEncodingException e) {
			LogUtil.debug("【调用支付宝接口】异常，UnsupportedEncodingException="+e.getMessage());
			e.printStackTrace();
			return uigXmlMgr.initErrorXML(entity, "0009", "【调用支付宝接口】异常。", e.getMessage()).outputXMLStr();
		}

	}


	public String doAction(Map<String, String> requestMap, AlipayOrderEntity entity) {
		String type = requestMap.get("type");
		this.service = (ZshInterfacePayService) SpringContextUtils.getBeanById(type);
		if (this.service != null) {
			return this.service.execute(requestMap, entity);
		} else {
			return uigXmlMgr.initErrorXML(entity, "0008", "业务未开通。", "业务未开通，请检查type属性").outputXMLStr();
		}
	}

}
