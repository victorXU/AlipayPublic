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
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 2015/12/21.
 */
public class AlipayPayOrderReqServiceImpl  implements ZshInterfacePayService {

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
     * @version 1.0, 2015-9-15
     * @see
     * @since V1.0
     * @param requestMap
     * @param entity
     * @return
     */
    public String execute(Map<String, String> requestMap, AlipayOrderEntity entity) {
        try {
            Map<String, String> dataMap = new HashMap<String, String>();
            // ----------------------------验证传入参数开始----------------------------
            if (!validateRequest(requestMap, entity, dataMap)) {
                return entity.getValidateResult();
            }
            // ----------------------------验证传入参数结束----------------------------
            //----------------------------排序开始----------------------------
            String dataSend = RequestUtil.orderSendBefore(dataMap).toString();
            //----------------------------排序结束----------------------------

            //----------------------------加密开始----------------------------
            String mysign = MD5.encode(dataSend + entity.getPartner(), ZshConfig.GBK);
            //----------------------------加密结束----------------------------


            //----------------------------处理中文开始----------------------------
            dataMap.put("subject", URLEncoder.encode(entity.getSubject(), ZshConfig.GBK));
            dataMap.put("sign",mysign);
            dataMap.put("sign_type", "MD5");
            dataSend = RequestUtil.orderSendBefore(dataMap).toString();
            // ----------------------------发送到易付宝开始----------------------------
            String response = RequestUtil.post("https://mapi.alipay.com/gateway.do", dataSend);
            // ----------------------------发送到易付宝结束----------------------------
            // 支付宝返回报文对象。
            UigXmlMgr zshResponse = uigXmlMgr.parseXmlForAlipay(response);

            // 封装第三方返回报文头信息。
            UigXmlMgr headXml = uigXmlMgr.headResponseXml(entity);

            // 返回报文头和根据协议组装的报文数据
            UigXmlMgr returnXml = commonService.returnResponseXml(headXml, zshResponse, entity);
            // 更新易付宝返回结果
            int result = createMobilePayOrder(entity, response);
            if (result==0) {
                return uigXmlMgr.initErrorXML(entity, "0009", "销账机构处理的时候出现异常。", "更新微信返回结果失败!").outputXMLStr();
            } else {
                return returnXml.outputXMLStr();
            }

        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.debug(">>>用户查询失败，组装报文失败！" + e.fillInStackTrace());
            return uigXmlMgr.initErrorXML(entity, "0009", "销账机构处理的时候出现异常。", e.getMessage()).outputXMLStr();
        }
    }

    /**
     * 非空验证,并且把不为空的可空字段添加到map中
     * <p>
     * [功能详细描述]
     * <p>
     *
     * @author victor
     * @version 1.0, 2015-7-16
     * @see
     * @since V1.0
     * @param requestMap
     * @param entity
     */
    private boolean validateRequest(Map<String, String> requestMap, AlipayOrderEntity entity, Map<String, String> dataMap) {
        List<String> emptyList = new ArrayList<String>() {

            private static final long serialVersionUID = 1L;

            {
                add("notify_url");
                add("seller_id");
                add("buyer_id");
                add("buyer_email");
                add("operator_type");
                add("operator_id");
                add("body");
                add("show_url");
                add("currency");
                add("price");
                add("quantity");
                add("goods_detail");
                add("extend_params");
                add("it_b_pay");
                add("dynamic_id_type");
                add("dynamic_id ");
            }
        };
        String param="";
        for (String s : emptyList) {
            param = requestMap.get(s);
            if (StringTools.isNotEmpty(param)) {
                dataMap.put(s, param);
            }
        }
        String total_fee = requestMap.get("total_fee");
        if (StringTools.isEmpty(total_fee)) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0004", "关键数据为空", "total_fee参数为空").outputXMLStr());
            return false;
        } else {
            dataMap.put("total_fee", total_fee);
        }
        String product_code = requestMap.get("product_code");
        if (StringTools.isEmpty(product_code)) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0004", "关键数据为空", "product_code参数为空").outputXMLStr());
            return false;
        } else {
            dataMap.put("product_code", product_code);
        }

        String notify_url = requestMap.get("notify_url");
        if (StringTools.isNotEmpty(notify_url)) {
            entity.setNotify_url(notify_url);
        }
        String out_trade_no = RequestUtil.getGUID();
        dataMap.put("service", "alipay.acquire.createandpay ");
        dataMap.put("partner", entity.getPartner());
        dataMap.put("_input_charset", "utf-8");
        dataMap.put("out_trade_no", out_trade_no);
        dataMap.put("product_code", "QR_CODE_OFFLINE");
        dataMap.put("seller_email", entity.getSeller_email());

        entity.setOut_trade_no(out_trade_no);
        return true;
    }

    private int createMobilePayOrder(AlipayOrderEntity entity, String response) throws Exception{
        // 将字符串转化为XML文档对象
        Document document = DocumentHelper.parseText(response);
        // 获得文档的根节点
        Element root = document.getRootElement();
        Element alipay = (Element) root.selectSingleNode("/alipay");
        String is_success = alipay.elementText("is_success");

        if (is_success != null&& ("T".equalsIgnoreCase(is_success) || "success".equalsIgnoreCase(is_success))) {
            Element response_alipay = (Element) root.selectSingleNode("/alipay/response/alipay");
            entity.setResult_code(response_alipay.elementText("result_code"));
            entity.setError(response_alipay.elementText("detail_error_code"));
            entity.setShow_url(response_alipay.elementText("small_pic_url"));
            if ("SUCCESS".equals(entity.getResult_code())) {
                entity.setTrade_status("WAIT_BUYER_PAY");
            }
            return alipayOrderInfoMapper.insertAlipayOrderInfo(entity);
        }else {
            return 1;
        }
    }
}
