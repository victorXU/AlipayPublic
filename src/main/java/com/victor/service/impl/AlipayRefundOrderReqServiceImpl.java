package com.victor.service.impl;


import com.victor.mapper.AlipayOrderInfoMapper;
import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.CommonService;
import com.victor.service.ZshInterfacePayService;
import com.victor.util.*;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

/**
 * [一句话功能简述]<p>
 * [功能详细描述]<p>
 * @author victor
 * @version 1.0, 2015-9-16
 * @see
 * @since V1.0
 */
public class AlipayRefundOrderReqServiceImpl implements ZshInterfacePayService {

	@Resource
	private UigXmlMgr uigXmlMgr;

	@Resource
	private CommonService commonService;

	@Resource
	private AlipayOrderInfoMapper alipayOrderInfoMapper;
	/**
	 * [一句话功能简述]<p>
	 * [功能详细描述]<p>
	 * @author victor
	 * @version 1.0, 2015-9-16
	 * @see
	 * @since V1.0
	 * @param requestMap
	 * @param bean
	 * @return
	 */
	public String execute(Map<String, String> requestMap, AlipayOrderEntity bean) {
		LogUtil.debug("【支付宝退款接口】退款开始");
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
			dataMap.put("sign",mysign);
			dataMap.put("sign_type", "MD5");
			dataSend = RequestUtil.orderSendBefore(dataMap).toString();
			// ----------------------------发送到支付宝开始----------------------------
			String response = RequestUtil.post("https://mapi.alipay.com/gateway.do", dataSend);
			// ----------------------------发送到支付宝结束----------------------------
			LogUtil.debug("【支付宝退款接口】退款结果=" + response);
			// 支付宝返回报文对象。
			UigXmlMgr zshResponse = uigXmlMgr.parseXmlForAlipay(response);

			// 封装第三方返回报文头信息。
			UigXmlMgr headXml = uigXmlMgr.headResponseXml(bean);

			// 返回报文头和根据协议组装的报文数据
			UigXmlMgr returnXml = commonService.returnResponseXml(headXml, zshResponse, bean);
			// 更新支付宝返回结果
			int result = updateMobilePayOrder(bean, response);
			LogUtil.debug("【支付宝退款接口】退款结束");
			if (result==0) {
				return uigXmlMgr.initErrorXML(bean, "0009", "销账机构处理的时候出现异常。", "更新微信返回结果失败!").outputXMLStr();
			} else {
				return returnXml.outputXMLStr();
			}

		} catch (Exception e) {
			e.printStackTrace();
			LogUtil.debug("【支付宝退款接口】" + e.fillInStackTrace());
			return uigXmlMgr.initErrorXML(bean, "0009", "销账机构处理的时候出现异常。", e.getMessage()).outputXMLStr();
		}
	}
	
	/**
	 * 非空验证,并且把不为空的可空字段添加到map中<p>
	 * [一句话功能简述]<p>
	 * [功能详细描述]<p>
	 * @author victor
	 * @version 1.0, 2015-8-5
	 * @see
	 * @since V1.0
	 * @param requestMap
	 * @param bean
	 * @param dataMap
	 * @return
	 */
	private boolean validateRequest(Map<String, String> requestMap, AlipayOrderEntity bean, Map<String, String> dataMap) {

		String out_trade_no = requestMap.get("out_trade_no");
		if (StringTools.isNotEmpty(out_trade_no)) {
			dataMap.put("out_trade_no", out_trade_no);
			bean.setOut_trade_no(out_trade_no);
		}else {
			LogUtil.debug("【支付宝退款接口】out_trade_no为空");
			bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean, "0004", "关键数据为空", "out_trade_no参数为空").outputXMLStr());
		}
		
		String refund_fee = requestMap.get("refund_fee");
		if (StringTools.isEmpty(refund_fee)) {
			LogUtil.debug("【支付宝退款接口】refund_amount");
			bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean, "0004", "关键数据为空", "refund_fee参数为空").outputXMLStr());
			return false;
		} else {
			dataMap.put("refund_amount", refund_fee);
			bean.setRefund_fee(refund_fee);
		}
		dataMap.put("service", "alipay.acquire.refund");
		dataMap.put("partner", bean.getPartner());
		dataMap.put("_input_charset", "utf-8");
		
		return true;
	}
	
	private int updateMobilePayOrder(AlipayOrderEntity bean, String response) throws Exception{
		LogUtil.debug("【支付宝退款接口】更新退款数据到数据库开始");
		// 将字符串转化为XML文档对象
		Document document = DocumentHelper.parseText(response);
		// 获得文档的根节点  
		Element root = document.getRootElement();
		Element alipay = (Element) root.selectSingleNode("/alipay");
		String is_success = alipay.elementText("is_success");
		int result=0;
		if (is_success != null&& ("T".equalsIgnoreCase(is_success) || "success".equalsIgnoreCase(is_success))) {
			Element response_alipay = (Element) root.selectSingleNode("/alipay/response/alipay");
			String result_code = response_alipay.elementText("result_code");
			bean.setRefund_code(result_code);
			bean.setDetail_error_code(response_alipay.elementText("detail_error_code"));
			bean.setDetail_error_des(response_alipay.elementText("detail_error_des"));
			bean.setRefund_fee(bean.getTotal_fee());
			result = alipayOrderInfoMapper.updateAlipayOrderInfo(bean);
		}

		LogUtil.debug("【支付宝退款接口】更新退款数据到数据库结束，result=" + result);
		return result;
	}

}