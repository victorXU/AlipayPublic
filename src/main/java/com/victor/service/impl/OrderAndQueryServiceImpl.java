package com.victor.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.crop.web.util.UserUtils;
import com.victor.mapper.AlipayOrderInfoMapper;
import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.OrderAndQueryService;
import com.victor.util.*;
import org.apache.commons.httpclient.HttpClient;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Administrator on 2015/12/24.
 */
@Service("orderAndQueryService")
public class OrderAndQueryServiceImpl implements OrderAndQueryService {
    @Resource
    private AlipayOrderInfoMapper alipayOrderInfoMapper;

    private Map<String, String> tradeStatusMap = new HashMap<String, String>(){{
        put("WAIT_BUYER_PAY", "交易创建，等待买家付款");
        put("TRADE_CLOSED", "关闭的交易");
        put("TRADE_FINISHED", "交易成功且结束");
        put("TRADE_PENDING", "等待卖家收款");
        put("TRADE_SUCCESS", "交易成功");
    }};
	private ArrayList<String> errorMap = new ArrayList<String>(){{
		add("ILLEGAL_SIGN");
		add("ILLEGAL_DYN_MD5_KEY");
		add("ILLEGAL_ENCRYPT");
		add("ILLEGAL_ARGUMENT");
		add("ILLEGAL_SERVICE");
		add("ILLEGAL_USER");
		add("ILLEGAL_PARTNER");
		add("ILLEGAL_EXTERFACE ");
		add("ILLEGAL_PARTNER_EXTERFACE");
		add("ILLEGAL_SECURITY_PROFILE");
		add("ILLEGAL_AGENT");
		add("ILLEGAL_SIGN_TYPE");
		add("ILLEGAL_CHARSET");
		add("HAS_NO_PRIVILEGE");
		add("INVALID_CHARACTER_SET");
		add("SYSTEM_ERROR");
		add("SESSION_TIMEOUT");
		add("ILLEGAL_TARGET_SERVICE");
		add("ILLEGAL_ACCESS_SWITCH_SYSTEM ");
		add("EXTERFACE_IS_CLOSED");
	}};

    private Map<String,String> refundDetailErrorCode = new HashMap<String, String>(){{
        put("INVALID_PARAMETER ", "参数无效");
        put("TRADE_ROLE_ERROR", "没有该笔交易的退款或撤销权限");
        put("DISCORDANT_REPEAT_REQUEST", "同一笔退款或撤销单号金额不一致");
        put("TRADE_HAS_CLOSE", "交易已经关闭");
        put("REASON_TRADE_BEEN_FREEZEN", "交易已经被冻结");
        put("BUYER_ERROR", "买家不存在");
        put("SELLER_ERROR", "卖家不存在");
        put("TRADE_NOT_EXIST", "交易不存在");
        put("TRADE_STATUS_ERROR", "交易不存在");
        put("TRADE_HAS_FINISHED ", "交易已结束");
        put("REFUND_AMT_NOT_EQUAL_TOTAL", "撤销或退款金额与订单金额不一致");
        put("", "");
    }};
	public String orderPay(String total_fee, String dynamic_id) {
		JSONObject jsonObject = new JSONObject();
        Map<String,Object> paramMap = RequestUtil.getParamData();
        paramMap.put("type","alipayPayOrderReqServiceReq");
        paramMap.put("product_code","BARCODE_PAY_OFFLINE");
        paramMap.put("notify_url", ZshConfig.CREATE_AND_PAY_NOTIFY_URL);
        paramMap.put("out_trade_no", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        paramMap.put("subject", "宅生活统一支付订单");
        paramMap.put("total_fee", total_fee);
        paramMap.put("price", total_fee);
        paramMap.put("quantity", "1");
        paramMap.put("dynamic_id", dynamic_id);
//        paramMap.put("dynamic_type", "barcode");
        String dataSend = RequestUtil.orderSendBefore(paramMap).toString();
        LogUtil.debug("【支付宝统一支付接口】请求内容：dataSend=" + dataSend);
        // ----------------------------发送到支付宝开始----------------------------
        UigXmlPost post = new UigXmlPost();
        HttpClient httpclient = new HttpClient();
        HttpClientChacterUtil.setChacterIsUTF(httpclient);
        String response = post.post(ZshConfig.INTERFACE_URL, dataSend,"application/x-www-form-urlencoded;text/html;charset=UTF-8",httpclient);
        LogUtil.debug("【支付宝统一支付接口】返回结果：response=" + response);
        try {
            String responseStr = "";
            if (response != null && response.indexOf("\n") != -1) {
                response = response.replace('\n', ' ');
                Document doc = DocumentHelper.parseText(response);
                Element root = doc.getRootElement();
                Element alipay = (Element) root.selectSingleNode("/message/body/alipay");
                if (alipay==null){
                    alipay = (Element) root.selectSingleNode("/alipay");
                }
                if (alipay==null){
                    alipay = (Element) root.selectSingleNode("/message/head");
                    if (alipay!=null&&"Error".equals(alipay.elementText("type"))){
                        Element response_alipay = (Element) root.selectSingleNode("/message/body");
                        responseStr = response_alipay.elementText("errorDetails");
                        jsonObject.put("responseStr", responseStr);
                        return jsonObject.toString();
                    }
                }
                String is_success = alipay.elementText("is_success");
                String error = alipay.elementText("error");

                if (is_success != null&& ("T".equalsIgnoreCase(is_success)||"success".equalsIgnoreCase(is_success))) {
                    Element response_alipay = (Element) root.selectSingleNode("/message/body/alipay/response/alipay");
                    if (response_alipay==null){
                        response_alipay = (Element) root.selectSingleNode("/alipay/response/alipay");
                    }
                    String trade_no = response_alipay.elementText("trade_no");
                    String detail_error_des = response_alipay.elementText("detail_error_des");
                    String result_code = response_alipay.elementText("result_code");
                    String out_trade_no = response_alipay.elementText("out_trade_no");
                    if(result_code!=null&&result_code.equals("ORDER_FAIL")){
                        responseStr = detail_error_des;
                    }else {
                        jsonObject.put("trade_no", trade_no);
                        String returnString = alipayQuery(out_trade_no);
                        JSONObject returnJson = JSONObject.parseObject(returnString);
                        String retunResult = returnJson.get("result").toString().trim();
                        if(retunResult!=null&&retunResult.length()==0){
                            String trade_status = returnJson.get("trade_status").toString().trim();
                            jsonObject.put("trade_status", trade_status);
                            responseStr = "";
                        }else {
                            responseStr = "支付失败,请重新支付";
                        }
                    }


                }else {
                    Element response_alipay = (Element) root.selectSingleNode("/message/body/alipay/response/alipay");
                    if (response_alipay==null){
                        response_alipay = (Element) root.selectSingleNode("/alipay/response/alipay");
                    }
                    String detail_error_des = response_alipay.elementText("detail_error_des");
                    String result_code = response_alipay.elementText("result_code");
                    if (errorMap.contains(error)) {
                        responseStr = "系统支付异常，请联系技术支持部门";
                    }else if(result_code!=null&&result_code.equals("ORDER_FAIL")){
                        responseStr = detail_error_des;
                    }else {
                        responseStr = "下单支付异常";
                    }

                }

                jsonObject.put("responseStr", responseStr);
            }else {
                jsonObject.put("responseStr", "支付异常");
            }
        } catch (Exception e) {
            e.printStackTrace();
            jsonObject.put("responseStr", "下单支付异常");
        }
        return jsonObject.toString();
    }

	public String alipayQuery(String out_trade_no) {
        JSONObject jsonObject = new JSONObject();
        Map<String,Object> paramMap = RequestUtil.getParamData();
        paramMap.put("out_trade_no", out_trade_no);
        paramMap.put("type","alipayQueryOrderReq");
        UigXmlPost post = new UigXmlPost();
        HttpClient httpclient = new HttpClient();
        HttpClientChacterUtil.setChacterIsUTF(httpclient);
        String dataSend = RequestUtil.orderSendBefore(paramMap).toString();
        String response = post.post(ZshConfig.INTERFACE_URL, dataSend, "application/x-www-form-urlencoded;text/html;charset=UTF-8", httpclient);
        LogUtil.debug("【支付宝查询接口】返回结果：response=" + response);
	/*	<alipay>
			<is_success>T</is_success>
		<request>
			<param name="sign">1a1b10c605c557d4853e1426a73172d1</param>
			<param name="_input_charset">GBK</param>
			<param name="sign_type">MD5</param>
			<param name="service">alipay.acquire.query</param>
			<param name="partner">2088211560433214</param>
			<param name="out_trade_no">Q20140821103947</param>
		</request>
		<response>
			<alipay>
				<buyer_logon_id>643***@qq.com</buyer_logon_id>
				<buyer_user_id>2088802108144635</buyer_user_id>
				<out_trade_no>Q20140821103947</out_trade_no>
				<partner>2088211560433214</partner>
				<result_code>SUCCESS</result_code>
				<send_pay_date>2014-08-21 10:41:44</send_pay_date>
				<total_fee>0.01</total_fee>
				<trade_no>2014082121001004630014886116</trade_no>
				<trade_status>TRADE_SUCCESS</trade_status>
			</alipay>
		</response>
		<sign>5b811166de20b0baca97533b80a0cf3b</sign>
		<sign_type>MD5</sign_type>
	</alipay>*/

		try {
			if (response.indexOf("\n") != -1) {
				response = response.replace('\n', ' ');
			}
			Document doc = DocumentHelper.parseText(response);
			Element root = doc.getRootElement();

            Element response_alipay = (Element) root.selectSingleNode("/alipay/response/alipay");
            if (response_alipay==null){
                response_alipay = (Element) root.selectSingleNode("/message/body/alipay/response/alipay");
            }
            if (response_alipay==null){
                response_alipay = (Element) root.selectSingleNode("/message/head");
                if (response_alipay!=null&&"Error".equals(response_alipay.elementText("type"))){
                    Element alipay = (Element) root.selectSingleNode("/message/body");
                    jsonObject.put("responseStr", alipay.elementText("errorDetails"));
                    return jsonObject.toString();
                }
            }
            String trade_status = response_alipay.elementText("trade_status");
            String total_fee = response_alipay.elementText("total_fee");
            String send_pay_date = response_alipay.elementText("send_pay_date");

            jsonObject.put("result", "");
            jsonObject.put("trade_status", tradeStatusMap.get(trade_status));
            jsonObject.put("total_fee", total_fee);
            jsonObject.put("send_pay_date", send_pay_date);
            jsonObject.put("out_trade_no", out_trade_no);


        } catch (Exception e) {
            e.printStackTrace();
            jsonObject.put("result", "【支付宝查询接口】异常"+e.getMessage());
            return jsonObject.toString();
        }
        return jsonObject.toString();
    }


    public String refundService(String out_trade_no,String totalmoeny) {
        JSONObject jsonObject = new JSONObject();
        Map<String,Object> paramMap = RequestUtil.getParamData();
        paramMap.put("out_trade_no", out_trade_no);
        paramMap.put("refund_fee", totalmoeny);
        paramMap.put("type", "alipayRefundOrderReqServiceReq");
        UigXmlPost post = new UigXmlPost();
        HttpClient httpclient = new HttpClient();
        HttpClientChacterUtil.setChacterIsUTF(httpclient);
        String dataSend = RequestUtil.orderSendBefore(paramMap).toString();
        String response = post.post(ZshConfig.INTERFACE_URL, dataSend, "application/x-www-form-urlencoded;text/html;charset=UTF-8", httpclient);
//        String response ="";
        LogUtil.debug("【支付宝退款接口】返回结果：response=" + response);
        try {
            if (response==null||"".equals(response)){
                jsonObject.put("result", "【支付宝退款接口】请求结果为空");
                return jsonObject.toString();
            }
            if (response.indexOf("\n") != -1) {
                response = response.replace('\n', ' ');
            }
            Document doc = DocumentHelper.parseText(response);
            Element root = doc.getRootElement();

            Element response_alipay = (Element) root.selectSingleNode("/alipay/response/alipay");
            if (response_alipay==null){
                response_alipay = (Element) root.selectSingleNode("/message/body/alipay/response/alipay");
            }
            if (response_alipay==null){
                response_alipay = (Element) root.selectSingleNode("/message/head");
                if (response_alipay!=null&&"Error".equals(response_alipay.elementText("type"))){
                    Element alipay = (Element) root.selectSingleNode("/message/body");
                    jsonObject.put("result", alipay.elementText("errorDetails"));
                    return jsonObject.toString();
                }
            }
            String result_code = response_alipay.elementText("result_code");

            if ("SUCCESS".equalsIgnoreCase(result_code)){
                jsonObject.put("result", "成功退款"+totalmoeny+"元");
            }else{
                String detail_error_code = response_alipay.elementText("detail_error_code");
                jsonObject.put("result", "退款失败:"+refundDetailErrorCode.get(detail_error_code));

            }
        } catch (Exception e) {
            e.printStackTrace();
            jsonObject.put("result", "【支付宝退款接口】异常"+e.getMessage());
            return jsonObject.toString();
        }
        return jsonObject.toString();
    }

    public Map<String, Object> queryOrder(Map<String, Object> ParamMap) {
        final List<AlipayOrderEntity> alipayOrderEntities = alipayOrderInfoMapper.queryOrder(ParamMap);
        final int totalNum = alipayOrderInfoMapper.queryOrderNum(ParamMap);
        final Double totalFee = alipayOrderInfoMapper.queryOrderMoney(ParamMap);
        return new HashMap<String, Object>(){{
            put("alipayOrderEntities",alipayOrderEntities);
            put("totalNum",totalNum);
            put("totalFee",totalFee==null?0:totalFee.toString());
        }};
    }
}
