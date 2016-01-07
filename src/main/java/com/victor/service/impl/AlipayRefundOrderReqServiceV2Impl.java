package com.victor.service.impl;


import com.alibaba.fastjson.JSONObject;
import com.alipay.api.AlipayClient;
import com.alipay.api.request.AlipayTradeRefundRequest;
import com.alipay.api.response.AlipayTradeRefundResponse;
import com.victor.factory.AlipayAPIClientFactory;
import com.victor.mapper.AlipayOrderInfoMapper;
import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.CommonService;
import com.victor.service.ZshInterfacePayService;
import com.victor.util.*;
import org.apache.commons.httpclient.HttpClient;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Map;

/**
 * [一句话功能简述]<p>
 * [功能详细描述]<p>
 *
 * @author victor
 * @version 1.0, 2015-9-16
 * @see
 * @since V1.0
 */
@Service("alipayRefundOrderReqServiceReqV2")
public class AlipayRefundOrderReqServiceV2Impl implements ZshInterfacePayService {

    @Resource
    private UigXmlMgr uigXmlMgr;

    @Resource
    private AlipayOrderInfoMapper alipayOrderInfoMapper;

    /**
     * [一句话功能简述]<p>
     * [功能详细描述]<p>
     *
     * @param dataMap
     * @param bean
     * @return
     * @author victor
     * @version 1.0, 2015-9-16
     * @see
     * @since V1.0
     */
    public String execute(Map<String, Object> dataMap, AlipayOrderEntity bean) {
        LogUtil.debug("【支付宝退款接口V2】退款开始");
        AlipayClient alipayClient = AlipayAPIClientFactory.getAlipayClient(bean);
        AlipayTradeRefundRequest request = new AlipayTradeRefundRequest();
        request.setBizContent(dataMap.get("biz_content").toString());
        AlipayTradeRefundResponse response = null;
        try {
            response = alipayClient.execute(request);
                        // 退款成功,资金有变动,做业务及账务处理
            if (response.isSuccess()){
                updateMobilePayOrder(bean,response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.debug("【支付宝退款接口V2】" + e.fillInStackTrace());
            return uigXmlMgr.initErrorXML(bean, "0009", "【支付宝退款接口V2】异常。", e.getMessage()).outputXMLStr();
        }
        LogUtil.debug("【支付宝退款接口V2】退款结束");
        JSONObject jsonObject =  new JSONObject();
        if (response.isSuccess()){
            jsonObject.put("responseStr","退款成功");
        }else {
            jsonObject.put("responseStr",response.getSubMsg());
        }
        return jsonObject.toString();
    }

    /**
     * 非空验证,并且把不为空的可空字段添加到map中<p>
     * [一句话功能简述]<p>
     * [功能详细描述]<p>
     *
     * @param requestMap
     * @param bean
     * @param dataMap
     * @return
     * @author victor
     * @version 1.0, 2015-8-5
     * @see
     * @since V1.0
     */
    public boolean validateRequest(Map<String, Object> requestMap, AlipayOrderEntity bean, Map<String, Object> dataMap) {
        JSONObject paramJson  = new JSONObject();
        Object trade_no = requestMap.get("trade_no");
        if (trade_no!=null) {
            paramJson.put("trade_no", trade_no);
            bean.setTrade_no(trade_no.toString());
        } else {
            LogUtil.debug("【支付宝退款接口V2】out_trade_no为空为空");
            bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean, "0004", "【支付宝退款接口V2】关键数据为空", "out_trade_no参数为空").outputXMLStr());
        }

        Object refund_fee = requestMap.get("refund_fee");
        if (refund_fee!=null) {
            LogUtil.debug("【支付宝退款接口V2】refund_amount");
            bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean, "0004", "【支付宝退款接口V2】关键数据为空", "refund_fee参数为空").outputXMLStr());
            return false;
        } else {
            paramJson.put("refund_amount", refund_fee);
            bean.setRefund_fee(refund_fee.toString());
        }
        Object userid = requestMap.get("userid");
        if (userid==null) {
            bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean,
                    "0004", "【支付宝退款接口V2】关键数据为空", "userid参数为空").outputXMLStr());
            return false;
        } else {
            bean.setUpdateuserid(userid.toString());
        }
        Object username = requestMap.get("username");
        if (username==null) {
            bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean,
                    "0004", "【支付宝退款接口V2】关键数据为空", "username参数为空").outputXMLStr());
            return false;
        } else {
            bean.setUpdateusername(username.toString());
        }
        Object usercode = requestMap.get("usercode");
        if (userid==null) {
            bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean,
                    "0004", "【支付宝退款接口V2】关键数据为空", "usercode参数为空").outputXMLStr());
            return false;
        } else {
            bean.setUpdateusercode(usercode.toString());
        }
        Object userip = requestMap.get("userip");
        if (userip==null) {
            bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean,
                    "0004", "【支付宝退款接口V2】关键数据为空", "userip参数为空").outputXMLStr());
            return false;
        } else {
            bean.setUpdateip(userip.toString());
        }
        dataMap.put("_input_charset", "utf-8");

        return true;
    }

    private int updateMobilePayOrder(AlipayOrderEntity bean, AlipayTradeRefundResponse response) throws Exception {
        LogUtil.debug("【支付宝退款接口V2】更新退款数据到数据库开始");
        bean.setRefund_code("success");
        bean.setOut_trade_no(response.getOutTradeNo());
       int result = alipayOrderInfoMapper.updateAlipayOrderInfo(bean);
        LogUtil.debug("【支付宝退款接口V2】更新退款数据到数据库结束，result=" + result);
        return result;
    }

}
