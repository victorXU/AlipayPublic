package com.victor.controller;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.commons.httpclient.HttpClient;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import com.zsh.entity.PayParameter;
import com.zsh.mapper.CommonMapper;
import com.zsh.util.HttpClientChacterUtil;
import com.zsh.util.JacksonUtils;
import com.zsh.util.LogUtil;
import com.zsh.util.MD5;
import com.zsh.util.MapTools;
import com.zsh.util.RequestUtil;
import com.zsh.util.StringTools;
import com.zsh.util.UigXmlPost;

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
	private CommonMapper commonMapper;

	@RequestMapping("/yifubaoReceiveNotify")
	public String yifubaoReceiveNotify(HttpServletRequest request, Model model) throws Exception {
		Thread.sleep(1000);
		Map<String, String> requestMap = RequestUtil.getRequestParams(request);
		String orders = requestMap.get("orders");
		Map<String, String> ordersMap = JacksonUtils.json2map(orders, String.class);
		final String outOrderNo = ordersMap.get("outOrderNo");
		String instId = outOrderNo.split("_")[0];
		Map<String, String> resultMap = commonMapper.queryKeyByInstid(instId);
		//验证签名
		boolean checkResult = MD5.checkSignForYifubao(resultMap.get("INTERFACE_KEY"), requestMap);
		if (!checkResult) {
			throw new RuntimeException("易付宝二维码支付回调---》签名验证失败，非合法回调");
		}
		//查询operating_srl
		PayParameter parameter= commonMapper.queryMobilePayByOutTradeNo(new HashMap<String, String>(){/**  描述  */      
			
			private static final long serialVersionUID = 1L;

		{
			put("out_trade_no", outOrderNo);
		}});
		
		if (parameter==null) {
			throw new RuntimeException("易付宝二维码支付回调---》查询移动支付表信息报错,没有对应的移动支付订单");
		}
		//更新数据库状态
		PayParameter payParameter = new PayParameter();
		payParameter.setOperating_srl(parameter.getOperating_srl());
		payParameter.setTrade_no(ordersMap.get("orderId"));
		payParameter.setPay_time(ordersMap.get("pay_time"));
		payParameter.setBuyer_id(ordersMap.get("buyerUserNo"));
		payParameter.setResult_code(ordersMap.get("responseCode"));
		
		if ("0000".equals(ordersMap.get("responseCode"))) {
			payParameter.setTrade_status("TRADE_SUCCESS");
		}
		
		int updateResult = commonMapper.updateMobilePay(payParameter);
		if (updateResult==1) {
			throw new RuntimeException("易付宝二维码支付回调---》更新移动支付表信息报错");
		}
		if (StringTools.isNotEmpty(payParameter.getNotify_url())) {
			UigXmlPost post = new UigXmlPost();
			HttpClient httpclient = new HttpClient();
			HttpClientChacterUtil.setChacterIsGbk(httpclient);
			String response = post.post(payParameter.getNotify_url(),MapTools.gaoYangGameSendBefore(requestMap).toString(),
							"application/x-www-form-urlencoded;text/html;charset=UTF-8",httpclient);
			LogUtil.debug("数据库状态更新成功，回调结束，respons：-----" + response);
		}
		
		return "success";
	}
	
	@RequestMapping("/yifubaoRefundNotify")
	public String yifubaoRefundNotify(HttpServletRequest request) throws Exception{
		Thread.sleep(1000);
		Map<String, String> requestMap = RequestUtil.getRequestParams(request);
		String refundOrderNo = requestMap.get("refundOrderNo");
		Map<String, String> paramMap = new HashMap<String, String>();
		paramMap.put("refund_no", refundOrderNo);
		//查询operating_srl
		PayParameter parameter = commonMapper.queryMobilePayByOutTradeNo(paramMap);
		if (parameter==null) {
			throw new RuntimeException("易付宝二维码退款回调---》查询移动支付表信息报错,没有对应的移动支付订单");
		}
		
		//验证签名
		Map<String, String> resultMap = commonMapper.queryKeyByInstid(parameter.getBusinessid());
		//验证签名
		boolean checkResult = MD5.checkSignForYifubao(resultMap.get("INTERFACE_KEY"), requestMap);
		if (!checkResult) {
			throw new RuntimeException("易付宝二维码支付回调---》签名验证失败，非合法回调");
		}
		//更新数据库状态
		PayParameter payParameter = new PayParameter();
		payParameter.setOperating_srl(parameter.getOperating_srl());
		payParameter.setRefund_msg(requestMap.get("responseMsg"));
		payParameter.setRefund_code(requestMap.get("responseCode"));
		
		int updateResult = commonMapper.updateMobilePay(payParameter);
		if (updateResult==1) {
			throw new RuntimeException("易付宝二维码支付回调---》更新移动支付表信息报错");
		}
		return "success";
	}
	
	
	@RequestMapping("/weixinReceiveNotify")
	public String weixinPayNotify(HttpServletRequest request) throws Exception{
		Thread.sleep(1000);
		 DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();     
	     DocumentBuilder db = dbf.newDocumentBuilder();     
	     Document doc = db.parse(request.getInputStream());
	     System.out.println("-------------微信支付回调开始---------------");
	     System.out.println("return_code----------"+getValueByTagName(doc,"return_code"));
	     System.out.println("return_msg----------"+getValueByTagName(doc,"return_msg"));
	     System.out.println("out_trade_no----------"+getValueByTagName(doc,"out_trade_no"));
	     String return_code = getValueByTagName(doc,"return_code");
	     if ("SUCCESS".equalsIgnoreCase(return_code)) {
	       PayParameter payParameter = new PayParameter();
	       payParameter.setOut_trade_no(getValueByTagName(doc,"out_trade_no"));
	       payParameter.setTrade_no(getValueByTagName(doc,"transaction_id"));
	       String result_code = getValueByTagName(doc,"result_code");
	       if ("SUCCESS".equalsIgnoreCase(result_code)) {
	    	   payParameter.setTrade_status("TRADE_SUCCESS");
	       }
	       int payResult = commonMapper.updateMobilePay(payParameter);
	       if (payResult==0) {
	    	   throw new RuntimeException("二维码支付回调---》更新移动支付表信息报错");
	       }
	     }
	     System.out.println("-------------微信支付回调结束---------------");
		
		return "success";
	}
	
	public static String getValueByTagName(Document doc, String tagName){  
        if(doc == null || StringTools.isEmpty(tagName)){  
            return "";  
        }  
        NodeList pl = doc.getElementsByTagName(tagName);  
        if(pl != null && pl.getLength() > 0){  
            return pl.item(0).getTextContent();  
        }  
        return "";  
    }  
}
