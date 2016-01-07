package com.victor.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.crop.web.util.UserUtils;
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
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service("alipayPayOrderReqServiceReq")
public class AlipayPayOrderReqServiceImpl implements ZshInterfacePayService {
    @Resource
    private UigXmlMgr uigXmlMgr;

    @Resource
    private CommonService commonService;

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
        LogUtil.debug("【支付宝统一支付接口】支付开始");
        try {
            // ----------------------------排序开始----------------------------
            String dataSend = RequestUtil.orderSendBefore(dataMap).toString();
            // ----------------------------排序结束----------------------------

            // ----------------------------加密开始----------------------------
            String mysign = MD5.encode(dataSend + entity.getPartner_key(),
                    ZshConfig.GBK);
            // ----------------------------加密结束----------------------------

            // ----------------------------处理中文开始----------------------------
            Object subject = dataMap.get("subject");
            if (subject!=null){
                dataMap.put("subject",URLEncoder.encode(subject.toString(), ZshConfig.GBK));
            }
            dataMap.put("sign", mysign);
            dataMap.put("sign_type", "MD5");
            dataSend = RequestUtil.orderSendBefore(dataMap).toString();
            LogUtil.debug("【支付宝统一支付接口】请求内容：dataSend=" + dataSend);
            // ----------------------------发送到支付宝开始----------------------------
            UigXmlPost post = new UigXmlPost();
            HttpClient httpclient = new HttpClient();
            HttpClientChacterUtil.setChacterIsUTF(httpclient);
            String response = post.post("https://mapi.alipay.com/gateway.do", dataSend,"application/x-www-form-urlencoded;text/html;charset=GBK",httpclient);
            LogUtil.debug("【支付宝统一支付接口】返回结果：response=" + response);
            // ----------------------------发送到支付宝结束----------------------------
            // 支付宝返回报文对象。
            UigXmlMgr zshResponse = uigXmlMgr.parseXmlForAlipay(response);

            // 封装第三方返回报文头信息。
            UigXmlMgr headXml = uigXmlMgr.headResponseXml(entity);

            // 返回报文头和根据协议组装的报文数据
            UigXmlMgr returnXml = commonService.returnResponseXml(headXml, zshResponse, entity);
            // 更新支付宝返回结果
            int result = createMobilePayOrder(entity, response);
            if (result == 0) {
                LogUtil.debug("【支付宝统一支付接口】更新支付宝返回结果失败!result=" + result);
                return uigXmlMgr.initErrorXML(entity, "0009", "【支付宝统一支付接口】异常",
                        "更新支付宝返回结果失败!").outputXMLStr();
            } else {
                return response;
            }

        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.debug("【支付宝统一支付接口】异常！" + e.getMessage());
            return uigXmlMgr.initErrorXML(entity, "0009", "【支付宝支付接口】异常。",
                    e.getMessage()).outputXMLStr();
        }
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
        Object subject = requestMap.get("subject");
        if (subject!=null) {
            dataMap.put("subject", subject);
            entity.setSubject(subject.toString());
        }
        Object dynamic_id = requestMap.get("dynamic_id");
        if (dynamic_id!=null) {
            dataMap.put("dynamic_id", dynamic_id);
            entity.setDynamic_id(dynamic_id.toString());
        }
        Object goods_detail = requestMap.get("goods_detail");
        if (goods_detail!=null) {
            dataMap.put("goods_detail", goods_detail);
            entity.setGoods_detail(goods_detail.toString());
        }
        Object quantity = requestMap.get("quantity");
        if (quantity!=null) {
            dataMap.put("quantity", quantity);
            entity.setQuantity(quantity.toString());
        }
        Object body = requestMap.get("body");
        if (body!=null) {
            dataMap.put("body", body);
            entity.setBody(body.toString());
        }
        Object notify_url = requestMap.get("notify_url");
        if (notify_url!=null) {
            dataMap.put("notify_url", notify_url);
            entity.setNotify_url(notify_url.toString());
        }
        Object total_fee = requestMap.get("total_fee");
        if (total_fee==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口】关键数据为空", "total_fee参数为空").outputXMLStr());
            return false;
        } else {
            dataMap.put("total_fee", total_fee);
            entity.setTotal_fee(total_fee.toString());
            dataMap.put("price", total_fee);
            entity.setPrice(total_fee.toString());
        }
        Object price = requestMap.get("price");
        if (price!=null) {
            dataMap.put("price", price);
            entity.setPrice(price.toString());
        }

        Object userid = requestMap.get("userid");
        if (userid==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口】关键数据为空", "userid参数为空").outputXMLStr());
            return false;
        } else {
            entity.setCreateuserid(userid.toString());
        }
        Object username = requestMap.get("username");
        if (username==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口】关键数据为空", "username参数为空").outputXMLStr());
            return false;
        } else {
            entity.setCreateusername(username.toString());
        }
        Object usercode = requestMap.get("usercode");
        if (userid==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口】关键数据为空", "usercode参数为空").outputXMLStr());
            return false;
        } else {
            entity.setCreateusercode(usercode.toString());
        }
        Object userip = requestMap.get("userip");
        if (userip==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口】关键数据为空", "userip参数为空").outputXMLStr());
            return false;
        } else {
            entity.setCreateuserid(userip.toString());
        }
        Object product_code = requestMap.get("product_code");
        if (product_code==null) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity,
                    "0004", "【支付宝统一支付接口】关键数据为空", "product_code参数为空").outputXMLStr());
            return false;
        } else {
            dataMap.put("product_code", product_code);
            entity.setProduct_code(product_code.toString());
            //声波、指纹、条码、淘宝声波支付判断
            String dynamic_id_type="";
            String agent_id="";
            if("SOUNDWAVE_PAY_OFFLINE".equalsIgnoreCase((product_code.toString()))
                    ||
                    "TB_SOUNDWAVE_OFFLINE".equalsIgnoreCase((product_code.toString()))){

                dynamic_id_type = "wave_code";  //声波
                agent_id = "AGENT_ID_A";

            }else if("FINGERPRINT_FAST_PAY".equalsIgnoreCase((product_code.toString()))){

                dynamic_id_type = ""; //指纹
                agent_id = "AGENT_ID_B";
            }else if("BARCODE_PAY_OFFLINE".equalsIgnoreCase((product_code.toString()))){

                dynamic_id_type = "barcode"; //条码
                agent_id = "AGENT_ID_C";
            }
            dataMap.put("dynamicId_type", dynamic_id_type);
//            dataMap.put("agent_id", agent_id);
            entity.setDynamicid_type(dynamic_id_type);
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
            dataMap.put("out_trade_no", out_trade_no);
        } else {
            String out_trade_no_s = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            dataMap.put("out_trade_no", out_trade_no_s);
            entity.setOut_trade_no(out_trade_no_s);
        }

        JSONObject extend_params = new JSONObject();
        extend_params.put("AGENT_ID",entity.getAgentid());
        dataMap.put("extend_params", extend_params.toString());
        dataMap.put("service", "alipay.acquire.createandpay");
        dataMap.put("partner", entity.getPartner());
        dataMap.put("_input_charset", "utf-8");
        dataMap.put("seller_email", entity.getSeller_email());
        return true;
    }

    private int createMobilePayOrder(AlipayOrderEntity entity, String response)
            throws Exception {
        // 将字符串转化为XML文档对象
        Document document = DocumentHelper.parseText(response);
        // 获得文档的根节点
        Element root = document.getRootElement();
        Element alipay = (Element) root.selectSingleNode("/alipay");
        String is_success = alipay.elementText("is_success");

        if (is_success != null
                && ("T".equalsIgnoreCase(is_success) || "success"
                .equalsIgnoreCase(is_success))) {
            Element response_alipay = (Element) root
                    .selectSingleNode("/alipay/response/alipay");
            entity.setResult_code(response_alipay.elementText("result_code"));
            entity.setError(response_alipay.elementText("detail_error_code"));
            if ("SUCCESS".equals(entity.getResult_code())) {
                entity.setTrade_status("WAIT_BUYER_PAY");
            }
            return alipayOrderInfoMapper.insertAlipayOrderInfo(entity);
        } else {
            return 1;
        }
    }
}
