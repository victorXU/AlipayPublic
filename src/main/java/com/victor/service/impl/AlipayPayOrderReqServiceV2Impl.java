package com.victor.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.alipay.api.AlipayClient;
import com.alipay.api.domain.TradeFundBill;
import com.alipay.api.request.AlipayTradePayRequest;
import com.alipay.api.response.AlipayTradePayResponse;
import com.crop.web.util.UserUtils;
import com.victor.factory.AlipayAPIClientFactory;
import com.victor.mapper.AlipayOrderInfoMapper;
import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.ZshInterfacePayService;
import com.victor.util.*;
import org.apache.commons.httpclient.HttpClient;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service("alipayPayOrderReqServiceReqV2")
public class AlipayPayOrderReqServiceV2Impl implements ZshInterfacePayService {
    @Resource
    private UigXmlMgr uigXmlMgr;

    @Resource
    private AlipayOrderInfoMapper alipayOrderInfoMapper;

    /**
     * [一句话功能简述]
     * <p/>
     * [功能详细描述]
     * <p/>
     *
     * @param dataMap
     * @param entity
     * @return
     * @author victor
     * @version 1.0, 2015-9-15
     * @see
     * @since V1.0
     */
    public String execute(Map<String, Object> dataMap, AlipayOrderEntity entity) {
        LogUtil.debug("【支付宝统一支付接口V2】支付开始");

        AlipayClient alipayClient = AlipayAPIClientFactory.getAlipayClient();

        // 使用SDK，构建群发请求模型
        AlipayTradePayRequest request = new AlipayTradePayRequest();
        request.setBizContent(dataMap.get("bizContent").toString());
        AlipayTradePayResponse response = null;
        try {
            // 使用SDK，调用交易下单接口
            response = alipayClient.execute(request);
            // 这里只是简单的打印，请开发者根据实际情况自行进行处理
//                    System.out.println("买家账号：" + response.getBuyerLogonId());
//                    System.out.println("商户订单号：" + response.getOutTradeNo());
//                    System.out.println("支付宝交易号：" + response.getTradeNo());
//                    System.out.println("总金额：" + response.getTotalAmount());

                    // 对于返回付款中状态，需要调用收单查询接口查询订单付款状态
                    //TODO 根据查询结果更新数据库
                // 打印错误码
        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.debug("【支付宝统一支付接口V2】异常！" + e.getMessage());
            return uigXmlMgr.initErrorXML(entity, "0009", "【支付宝支付接口V2】异常。",
                    e.getMessage()).outputXMLStr();
        }
        JSONObject jsonObject =  new JSONObject();
        jsonObject.put("responseStr",response.getSubMsg());
        return jsonObject.toString();
    }

    /**
     * 非空验证,并且把不为空的可空字段添加到map中
     * <p/>
     * [功能详细描述]
     * <p/>
     *
     * @param requestMap
     * @param entity
     * @author victor
     * @version 1.0, 2015-7-16
     * @see
     * @since V1.0
     */
    public boolean validateRequest(Map<String, Object> requestMap,
                                   AlipayOrderEntity entity, Map<String, Object> dataMap) {
        JSONObject paramJson  = new JSONObject();

        Object total_fee = requestMap.get("total_fee");
        if (total_fee==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口V2】关键数据为空", "total_fee参数为空").outputXMLStr());
            return false;
        } else {
            paramJson.put("total_amount",total_fee);
            entity.setTotal_fee(total_fee.toString());
        }
        Object subject = requestMap.get("subject");
        if (subject!=null) {
            paramJson.put("subject",subject);
            entity.setSubject(subject.toString());
        }else {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口V2】关键数据为空", "subject参数为空").outputXMLStr());
            return false;
        }
        Object dynamic_id = requestMap.get("dynamic_id");
        if (dynamic_id!=null) {
            paramJson.put("auth_code",dynamic_id);
            entity.setDynamic_id(dynamic_id.toString());
        }else {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口V2】关键数据为空", "dynamic_id参数为空").outputXMLStr());
            return false;
        }

        Object userid = requestMap.get("userid");
        if (userid==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口V2】关键数据为空", "userid参数为空").outputXMLStr());
            return false;
        } else {
            entity.setCreateuserid(userid.toString());
        }
        Object username = requestMap.get("username");
        if (username==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口V2】关键数据为空", "username参数为空").outputXMLStr());
            return false;
        } else {
            entity.setCreateusername(username.toString());
        }
        Object usercode = requestMap.get("usercode");
        if (userid==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口V2】关键数据为空", "usercode参数为空").outputXMLStr());
            return false;
        } else {
            entity.setCreateusercode(usercode.toString());
        }
        Object userip = requestMap.get("userip");
        if (userip==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口V2】关键数据为空", "userip参数为空").outputXMLStr());
            return false;
        } else {
            entity.setCreateuserid(userip.toString());
        }

        /**
         * 订单号自动生成规则（暂定）：门店编码+收银员帐号+日期+序列号；
         例如：门店编码（storecode，10位）：25MH1S0051；
         店员编码（usercode，8位）：25MH1199，可以取最后3位，但不同代理商店员编号位数不一致；
         日期（6位）：151222；
         序列号（取5位）：00001；
         完整的订单号：25MH1S005119915122200001，共21位；
         建议订单号的规则简化，只取店员编码+日期+序列号；
         */
        Object out_trade_no = requestMap.get("out_trade_no");
        if (out_trade_no!=null) {
            entity.setOut_trade_no(out_trade_no.toString());
            paramJson.put("out_trade_no",out_trade_no);
        } else {
            String out_trade_no_s = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            entity.setOut_trade_no(out_trade_no_s.toString());
            paramJson.put("out_trade_no",out_trade_no_s);
        }

        paramJson.put("scene","bar_code");

        dataMap.put("bizContent",paramJson);


        return true;
    }

    private int createMobilePayOrder(AlipayOrderEntity entity,  AlipayTradePayResponse response)
            throws Exception {
        entity.setTrade_no(response.getTradeNo());
        entity.setBuyer_id(response.getBuyerLogonId());
        entity.setResult_code("ORDER_SUCCESS_PAY_SUCCESS");
        entity.setTrade_status("TRADE_SUCCESS");
        return alipayOrderInfoMapper.insertAlipayOrderInfo(entity);
    }
}
