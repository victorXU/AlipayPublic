package com.victor.service.impl;


import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.CommonService;
import com.victor.service.ZshInterfacePayService;
import com.victor.util.*;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

/**
 * [一句话功能简述]<p>
 * [功能详细描述]<p>
 * @author victor
 * @version 1.0, 2015-9-15
 * @see
 * @since V1.0
 */
@Service("alipayQueryOrderReq")
public class AlipayQueryOrderReqServiceImpl implements ZshInterfacePayService {

	@Resource
	private UigXmlMgr uigXmlMgr;

	@Resource
	private CommonService commonService;

	/**
	 * [一句话功能简述]<p>
	 * [功能详细描述]<p>
	 * @author victor
	 * @version 1.0, 2015-9-15
	 * @see
	 * @since V1.0
	 * @param requestMap
	 * @param bean
	 * @return
	 */
	public String execute(Map<String, String> requestMap, AlipayOrderEntity bean) {
		try {
			Map<String, String> dataMap = new HashMap<String, String>();
			// ----------------------------验证传入参数开始----------------------------
			if (!validateRequest(requestMap, bean, dataMap)) {
				return bean.getValidateResult();
			}
			// ----------------------------验证传入参数结束----------------------------
			//----------------------------排序开始----------------------------
			String dataSend = RequestUtil.orderSendBefore(dataMap).toString();
			//----------------------------排序结束----------------------------
			//----------------------------加密开始----------------------------
			String mysign = MD5.encode(dataSend + bean.getPartner(), ZshConfig.GBK);
			//----------------------------加密结束----------------------------
			//----------------------------处理中文开始----------------------------
			dataMap.put("sign_type", "MD5");
			dataMap.put("sign",mysign);
			dataSend = RequestUtil.orderSendBefore(dataMap).toString();
			// ----------------------------发送到易付宝开始----------------------------
			String response = RequestUtil.post("https://mapi.alipay.com/gateway.do", dataSend);
			// ----------------------------发送到易付宝结束----------------------------
			// 支付宝返回报文对象。
			UigXmlMgr zshResponse = uigXmlMgr.parseXmlForAlipay(response);

			// 封装第三方返回报文头信息。
			UigXmlMgr headXml = uigXmlMgr.headResponseXml(bean);

			// 返回报文头和根据协议组装的报文数据
			UigXmlMgr returnXml = commonService.returnResponseXml(headXml, zshResponse, bean);
			return returnXml.outputXMLStr();

		} catch (Exception e) {
			e.printStackTrace();
			LogUtil.debug(">>>用户查询失败，组装报文失败！" + e.fillInStackTrace());
			return uigXmlMgr.initErrorXML(bean, "0009", "销账机构处理的时候出现异常。", e.getMessage()).outputXMLStr();
		}
	}
	
	/**
	 * 非空验证,并且把不为空的可空字段添加到map中
	 * [一句话功能简述]<p>
	 * [功能详细描述]<p>
	 * @author victor
	 * @version 1.0, 2015-9-16
	 * @see
	 * @since V1.0
	 * @param requestMap
	 * @param bean
	 * @param dataMap
	 * @return
	 */
	private boolean validateRequest(Map<String, String> requestMap, AlipayOrderEntity bean, Map<String, String> dataMap) {
		String out_trade_no = requestMap.get("out_trade_no");
		if (StringTools.isEmpty(out_trade_no)) {
			bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean, "0004", "关键数据为空", "out_trade_no参数为空").outputXMLStr());
			return false;
		} else {
			dataMap.put("out_trade_no", out_trade_no);
		}
		dataMap.put("_input_charset", "GBK");
		dataMap.put("service", "alipay.acquire.query");
		dataMap.put("partner", bean.getPartner());
		return true;
	}
	

}
