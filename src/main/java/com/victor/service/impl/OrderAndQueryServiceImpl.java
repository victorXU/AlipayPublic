package com.victor.service.impl;

import com.alibaba.fastjson.JSONObject;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 2015/12/24.
 */
@Service("orderAndQueryService")
public class OrderAndQueryServiceImpl implements OrderAndQueryService {
    @Resource
    private AlipayOrderInfoMapper alipayOrderInfoMapper;

    private Map<String, String> tradeStatusMap = new HashMap<String, String>(){{
        put("WAIT_BUYER_PAY", "���״������ȴ���Ҹ���");
        put("TRADE_CLOSED", "�رյĽ���");
        put("TRADE_FINISHED", "���׳ɹ��ҽ���");
        put("TRADE_PENDING", "�ȴ������տ�");
        put("TRADE_SUCCESS", "���׳ɹ�");
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

	public String orderPay(String total_fee, String dynamic_id) {
		JSONObject jsonObject = new JSONObject();
        Map<String,Object> paramMap = RequestUtil.getParamData();
        paramMap.put("type","alipayPayOrderReqServiceReq");
        paramMap.put("product_code","BARCODE_PAY_OFFLINE");
        paramMap.put("notify_url", ZshConfig.CREATE_AND_PAY_NOTIFY_URL);
        paramMap.put("out_trade_no", "3402304823034812");
        paramMap.put("subject", "լ����ͳһ֧������");
        paramMap.put("total_fee", total_fee);
        paramMap.put("price", total_fee);
        paramMap.put("quantity", "1");
        paramMap.put("dynamic_id", dynamic_id);
//        paramMap.put("dynamic_type", "barcode");
        String dataSend = RequestUtil.orderSendBefore(paramMap).toString();
        LogUtil.debug("��֧����ͳһ֧���ӿڡ��������ݣ�dataSend=" + dataSend);
        // ----------------------------���͵�֧������ʼ----------------------------
        UigXmlPost post = new UigXmlPost();
        HttpClient httpclient = new HttpClient();
        HttpClientChacterUtil.setChacterIsUTF(httpclient);
        String response = post.post(ZshConfig.INTERFACE_URL, dataSend,"application/x-www-form-urlencoded;text/html;charset=UTF-8",httpclient);
        LogUtil.debug("��֧����ͳһ֧���ӿڡ����ؽ����response=" + response);
        try {
            String responseStr = "";
            if (response != null && response.indexOf("\n") != -1) {
                response = response.replace('\n', ' ');
                Document doc = DocumentHelper.parseText(response);
                Element root = doc.getRootElement();
                Element alipay = (Element) root.selectSingleNode("/message/body/alipay");
                String is_success = alipay.elementText("is_success");
                String error = alipay.elementText("error");

                if (is_success != null&& ("T".equalsIgnoreCase(is_success)||"success".equalsIgnoreCase(is_success))) {
                    Element response_alipay = (Element) root.selectSingleNode("/message/body/alipay/response/alipay");
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
                            responseStr = "֧��ʧ��,������֧��";
                        }
                    }


                }else {
                    Element response_alipay = (Element) root.selectSingleNode("/message/body/alipay/response/alipay");
                    String detail_error_des = response_alipay.elementText("detail_error_des");
                    String result_code = response_alipay.elementText("result_code");
                    if (errorMap.contains(error)) {
                        responseStr = "ϵͳ֧���쳣������ϵ����֧�ֲ���";
                    }else if(result_code!=null&&result_code.equals("ORDER_FAIL")){
                        responseStr = detail_error_des;
                    }else {
                        responseStr = "�µ�֧���쳣";
                    }

                }

                jsonObject.put("responseStr", responseStr);
            }else {
                jsonObject.put("responseStr", "֧���쳣��" +
                        "1��������֧����Ǯ����ʾ�Ѹ���ɹ������û��ṩ֧�������������²�ѯ��" +
                        "2��������δ����ɹ���������֧��" +
                        "3��������¶��֧��ʧ�ܣ�����ϵ����֧�ֲ���");
            }
        } catch (Exception e) {
            e.printStackTrace();
            jsonObject.put("responseStr", "�µ�֧���쳣");
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
        LogUtil.debug("��֧����ͳһ֧���ӿڡ����ؽ����response=" + response);
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
			jsonObject.put("result", "订单查询异常�?");
			return jsonObject.toString();
		}
		return jsonObject.toString();
	}


    public String refundService(Map<String, String> paramMap) {
        return null;
    }

    public Map<String, Object> queryOrder(Map<String, String> ParamMap) {
        final List<AlipayOrderEntity> alipayOrderEntities = alipayOrderInfoMapper.queryOrder(ParamMap);
        final int total = alipayOrderInfoMapper.queryOrderNum(ParamMap);
        return new HashMap<String, Object>(){{
            put("alipayOrderEntities",alipayOrderEntities);
            put("total",total);
        }};
    }
}
