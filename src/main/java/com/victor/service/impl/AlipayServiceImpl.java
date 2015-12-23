package com.victor.service.impl;



import com.victor.mapper.AlipayOrderInfoMapper;
import com.victor.pojo.AlipayOrderEntity;
import com.victor.pojo.PaymentDT;
import com.victor.pojo.ResponseEntity;
import com.victor.service.AliPayService;
import com.victor.util.MD5;
import com.victor.util.RequestUtil;
import com.victor.util.ZshConfig;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

/**
 * 支付宝统一预支付接口<p>
 * [功能详细描述]<p>
 * @author victor
 * @version 1.0, 2015-9-15
 * @see
 * @since V1.0
 */
@Service("aliPayService")
public class AlipayServiceImpl implements AliPayService {

	@Resource
	private AlipayOrderInfoMapper alipayOrderInfoMapper;

	public ResponseEntity alipayQuery(AlipayOrderEntity dt) {
		logger.info("【支付宝查询接口】查询开始");
		ResponseEntity entity = new ResponseEntity();
		try {
			Map<String, String> dataMap = new HashMap<String, String>();
			// ----------------------------传入参数开始----------------------------
			dataMap.put("out_trade_no", dt.getOut_trade_no());
			dataMap.put("_input_charset", "GBK");
			dataMap.put("service", "alipay.acquire.query");
			dataMap.put("partner", dt.getPartner());
			// ----------------------------验证传入参数结束----------------------------
			//----------------------------ZshConfig排序开始----------------------------
			String dataSend = RequestUtil.orderSendBefore(dataMap).toString();
			//----------------------------排序结束----------------------------
			//----------------------------加密开始----------------------------
			String mysign = MD5.encode(dataSend + dt.getPartner_key(), ZshConfig.GBK);
			//----------------------------加密结束----------------------------
			//----------------------------处理中文开始----------------------------
			dataMap.put("sign_type", "MD5");
			dataMap.put("sign",mysign);
			dataSend = RequestUtil.orderSendBefore(dataMap).toString();
			// ----------------------------发送到支付宝开始----------------------------
			String response = RequestUtil.post("https://mapi.alipay.com/gateway.do", dataSend);
			// ----------------------------发送到支付宝结束----------------------------
			if (response!=null){
				entity.setStatus(ZshConfig.SYSTEM_OK);
				entity.setBean(response);
				logger.info("【支付宝查询接口】查询结果="+response);
			}else{
				entity.setStatus(ZshConfig.SYSTEM_FAIL);
				entity.setMsg("【支付宝查询接口】返回值为空");
				logger.info("【支付宝查询接口】返回值为空"+response);
			}

		} catch (Exception e) {
			e.printStackTrace();
			entity.setStatus(ZshConfig.SYSTEM_FAIL);
			entity.setMsg("【支付宝查询接口】"+e.getMessage());
			return entity;
		}
		logger.info("【支付宝查询接口】查询结束");
		return entity;
	}

	public ResponseEntity aliPayPrePay(AlipayOrderEntity dt) {
		logger.info("【支付宝统一预支付接口】获取二维码开始");
		ResponseEntity entity = new ResponseEntity();
		try{
			Map<String, String> dataMap = new HashMap<String, String>();
			dataMap.put("service", "alipay.acquire.precreate");
			dataMap.put("partner", dt.getPartner());
			dataMap.put("_input_charset", "utf-8");
			dataMap.put("out_trade_no", dt.getOut_trade_no());
			dataMap.put("product_code", dt.getProduct_code());
			dataMap.put("total_fee", dt.getTotal_fee());
			dataMap.put("seller_email", dt.getSeller_email());
			dataMap.put("subject", URLEncoder.encode(dt.getSubject(),ZshConfig.GBK));
			dataMap.put("notify_url", ZshConfig.CREATE_AND_PAY_NOTIFY_URL);
			//----------------------------排序开始----------------------------
			String dataSend =  RequestUtil.orderSendBefore(dataMap).toString();
			//----------------------------排序结束----------------------------

			//----------------------------加密开始----------------------------
			String mysign = MD5.encode(dataSend + dt.getPartner_key(), ZshConfig.GBK);
			//----------------------------加密结束----------------------------


			//----------------------------处理中文开始----------------------------
			dataMap.put("subject", URLEncoder.encode(dt.getSubject(),ZshConfig.GBK));
			dataMap.put("sign",mysign);
			dataMap.put("sign_type", "MD5");
			dataSend =  RequestUtil.orderSendBefore(dataMap).toString();
			// ----------------------------发送到支付宝开始----------------------------
			String response = RequestUtil.post("https://mapi.alipay.com/gateway.do", dataSend);
			// ----------------------------发送到支付宝结束----------------------------
			if (response!=null){
				logger.info("【支付宝查询接口】查询结果="+response);
				entity = createMobilePayOrder(dt, response);

			}else{
				entity.setStatus(ZshConfig.SYSTEM_FAIL);
				entity.setMsg("【支付宝查询接口】返回值为空");
				logger.info("【支付宝查询接口】返回值为空"+response);
			}


		}catch (Exception e){
			e.printStackTrace();
			entity.setStatus("fail");
			entity.setMsg("【支付宝统一预支付接口】"+e.getMessage());
			logger.error("【支付宝统一预支付接口】" + e.getMessage());
		}
		logger.info("【支付宝统一预支付接口】获取二维码结束");
		return entity;
	}


	private ResponseEntity createMobilePayOrder(AlipayOrderEntity dt, String response) throws Exception{
		ResponseEntity entity = new ResponseEntity();
		// 将字符串转化为XML文档对象
		Document document = DocumentHelper.parseText(response);
		// 获得文档的根节点
		Element root = document.getRootElement();
		Element alipay = (Element) root.selectSingleNode("/alipay");
		String is_success = alipay.elementText("is_success");

		if (is_success != null&& ("T".equalsIgnoreCase(is_success) || "success".equalsIgnoreCase(is_success))) {
			Element response_alipay = (Element) root.selectSingleNode("/alipay/response/alipay");
			dt.setResult_code(response_alipay.elementText("result_code"));
			dt.setError(response_alipay.elementText("detail_error_code"));
			dt.setShow_url(response_alipay.elementText("small_pic_url"));
			if ("SUCCESS".equals(dt.getResult_code())) {
				dt.setTrade_status("WAIT_BUYER_PAY");
			}
			alipayOrderInfoMapper.insertAlipayOrderInfo(dt);
			entity.setStatus("success");
			entity.setMsg("获取二维码成功");
			entity.setBean(response);
		}else {
			entity.setStatus("fail");
			entity.setMsg("【获取二维码失败，请重新获取】"+alipay.elementText("error"));
		}
		return entity;
	}

	public ResponseEntity alipayRefund(AlipayOrderEntity dt) {
		logger.info("【支付宝退款接口】退款开始");
		ResponseEntity entity = new ResponseEntity();
		try {
			
			Map<String,String> data = new HashMap<String, String>();

			//必选
			data.put("service", "alipay.acquire.refund");
			data.put("partner", dt.getPartner());
			data.put("_input_charset", "utf-8");
			data.put("refund_amount", dt.getTotal_fee());
			data.put("out_trade_no", dt.getOut_trade_no());

			//----------------------------封装结束----------------------------

			//----------------------------排序开始----------------------------
			String dataSend = RequestUtil.orderSendBefore(data).toString();
			//----------------------------排序结束----------------------------

			//----------------------------加密开始----------------------------
			String mysign = MD5.encode(dataSend + dt.getPartner_key(), ZshConfig.GBK);
			//----------------------------加密结束----------------------------

			//----------------------------处理中文开始----------------------------
			data.put("sign_type", "MD5");
			data.put("sign", mysign);

			//----------------------------处理中文结束----------------------------

			//----------------------------重新排序并生成&=字符串开始
			dataSend = RequestUtil.orderSendBefore(data).toString();
			//----------------------------重新排序并生成&=字符串结束

			//----------------------------发送到支付宝开始----------------------------
			String response = RequestUtil.post("https://mapi.alipay.com/gateway.do", dataSend);
			//----------------------------发送到支付宝结束----------------------------
			if (response!=null){
				logger.info("【支付宝退款接口】退款结果="+response);
				updateMobilePayOrder(dt, response);

			}else{
				entity.setStatus(ZshConfig.SYSTEM_FAIL);
				entity.setMsg("【支付宝退款接口】返回值为空");
				logger.info("【支付宝退款接口】返回值为空"+response);
			}

		}catch (Exception e){
			e.printStackTrace();
			entity.setStatus("fail");
			entity.setMsg("【支付宝退款接口】"+e.getMessage());
			return entity;
		}
		logger.info("【支付宝退款接口】退款结束");
		return entity;
	}
	private int updateMobilePayOrder(AlipayOrderEntity dt, String response) throws Exception{
		logger.info("【支付宝退款接口】更新退款数据到数据库开始");
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
			dt.setRefund_code(result_code);
			dt.setDetail_error_code(response_alipay.elementText("detail_error_code"));
			dt.setDetail_error_des(response_alipay.elementText("detail_error_des"));
			dt.setRefund_fee(dt.getTotal_fee());
			result = alipayOrderInfoMapper.updateAlipayOrderInfo(dt);

		}
		logger.info("【支付宝退款接口】更新退款数据到数据库结束，result="+result);
		return result;

	}
	
}
