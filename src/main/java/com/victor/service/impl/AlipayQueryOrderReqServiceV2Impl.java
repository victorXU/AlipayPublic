package com.victor.service.impl;


import com.alibaba.fastjson.JSONObject;
import com.alipay.api.AlipayClient;
import com.alipay.api.domain.TradeFundBill;
import com.alipay.api.request.AlipayTradeQueryRequest;
import com.alipay.api.response.AlipayTradeQueryResponse;
import com.victor.factory.AlipayAPIClientFactory;
import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.ZshInterfacePayService;
import com.victor.util.*;
import org.apache.commons.httpclient.HttpClient;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * [一句话功能简述]<p>
 * [功能详细描述]<p>
 *
 * @author victor
 * @version 1.0, 2015-9-15
 * @see
 * @since V1.0
 */
@Service("alipayQueryOrderReqV2")
public class AlipayQueryOrderReqServiceV2Impl implements ZshInterfacePayService {

    @Resource
    private UigXmlMgr uigXmlMgr;


    /**
     * [一句话功能简述]<p>
     * [功能详细描述]<p>
     *
     * @param dataMap
     * @param bean
     * @return
     * @author victor
     * @version 1.0, 2015-9-15
     * @see
     * @since V1.0
     */
    public String execute(Map<String, Object> dataMap, AlipayOrderEntity bean) {
        AlipayClient alipayClient = AlipayAPIClientFactory.getAlipayClient(bean);
        AlipayTradeQueryRequest request = new AlipayTradeQueryRequest();
        request.setBizContent(dataMap.get("biz_content").toString());
        AlipayTradeQueryResponse response = null;
        try {
            response = alipayClient.execute(request);

        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.debug("【支付宝查询接口V2】异常！" + e.getMessage());
            return uigXmlMgr.initErrorXML(bean, "0009", "【支付宝查询接口V2】异常。", e.getMessage()).outputXMLStr();
        }
        return response.toString();
    }

    /**
     * 非空验证,并且把不为空的可空字段添加到map中
     * [一句话功能简述]<p>
     * [功能详细描述]<p>
     *
     * @param requestMap
     * @param bean
     * @param dataMap
     * @return
     * @author victor
     * @version 1.0, 2015-9-16
     * @see
     * @since V1.0
     */
    public boolean validateRequest(Map<String, Object> requestMap, AlipayOrderEntity bean, Map<String, Object> dataMap) {
        JSONObject paramJson  = new JSONObject();
        String out_trade_no = requestMap.get("out_trade_no").toString();
        if (StringTools.isEmpty(out_trade_no)) {
            LogUtil.debug("【支付宝查询接口V2】out_trade_no参数为空！");
            bean.setValidateResult(uigXmlMgr.initErrorXMLNoKey(bean, "0004", "【支付宝查询接口V2】关键数据为空", "out_trade_no参数为空").outputXMLStr());
            return false;
        } else {
            paramJson.put("out_trade_no", out_trade_no);
        }
        dataMap.put("biz_content", paramJson.toString());
        return true;
    }


}
