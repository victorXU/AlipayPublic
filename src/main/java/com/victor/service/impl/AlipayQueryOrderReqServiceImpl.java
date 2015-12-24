package com.victor.service.impl;


import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.CommonService;
import com.victor.service.ZshInterfacePayService;
import com.victor.util.*;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
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
@Service("alipayQueryOrderReq")
public class AlipayQueryOrderReqServiceImpl implements ZshInterfacePayService {

    @Resource
    private UigXmlMgr uigXmlMgr;

    @Resource
    private CommonService commonService;

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
        try {
            //----------------------------排序开始----------------------------
            String dataSend = RequestUtil.orderSendBefore(dataMap).toString();
            //----------------------------排序结束----------------------------
            //----------------------------加密开始----------------------------
            String mysign = MD5.encode(dataSend + bean.getPartner(), ZshConfig.GBK);
            //----------------------------加密结束----------------------------
            //----------------------------处理中文开始----------------------------
            dataMap.put("sign_type", "MD5");
            dataMap.put("sign", mysign);
            dataSend = RequestUtil.orderSendBefore(dataMap).toString();
            // ----------------------------发送到支付宝开始----------------------------
            String response = RequestUtil.post("https://mapi.alipay.com/gateway.do", dataSend);
            // ----------------------------发送到支付宝结束----------------------------
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.debug("【支付宝查询接口】异常！" + e.getMessage());
            return uigXmlMgr.initErrorXML(bean, "0009", "【支付宝查询接口】异常。", e.getMessage()).outputXMLStr();
        }
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
        String out_trade_no = requestMap.get("out_trade_no").toString();
        if (StringTools.isEmpty(out_trade_no)) {
            LogUtil.debug("【支付宝查询接口】out_trade_no参数为空！");
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
