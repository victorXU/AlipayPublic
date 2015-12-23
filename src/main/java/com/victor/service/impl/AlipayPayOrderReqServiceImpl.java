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
     * [һ�仰���ܼ���]<p>
     * [������ϸ����]<p>
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
            // ----------------------------��֤���������ʼ----------------------------
            if (!validateRequest(requestMap, entity, dataMap)) {
                return entity.getValidateResult();
            }
            // ----------------------------��֤�����������----------------------------
            //----------------------------����ʼ----------------------------
            String dataSend = RequestUtil.orderSendBefore(dataMap).toString();
            //----------------------------�������----------------------------

            //----------------------------���ܿ�ʼ----------------------------
            String mysign = MD5.encode(dataSend + entity.getPartner(), ZshConfig.GBK);
            //----------------------------���ܽ���----------------------------


            //----------------------------�������Ŀ�ʼ----------------------------
            dataMap.put("subject", URLEncoder.encode(entity.getSubject(), ZshConfig.GBK));
            dataMap.put("sign",mysign);
            dataMap.put("sign_type", "MD5");
            dataSend = RequestUtil.orderSendBefore(dataMap).toString();
            // ----------------------------���͵��׸�����ʼ----------------------------
            String response = RequestUtil.post("https://mapi.alipay.com/gateway.do", dataSend);
            // ----------------------------���͵��׸�������----------------------------
            // ֧�������ر��Ķ���
            UigXmlMgr zshResponse = uigXmlMgr.parseXmlForAlipay(response);

            // ��װ���������ر���ͷ��Ϣ��
            UigXmlMgr headXml = uigXmlMgr.headResponseXml(entity);

            // ���ر���ͷ�͸���Э����װ�ı�������
            UigXmlMgr returnXml = commonService.returnResponseXml(headXml, zshResponse, entity);
            // �����׸������ؽ��
            int result = createMobilePayOrder(entity, response);
            if (result==0) {
                return uigXmlMgr.initErrorXML(entity, "0009", "���˻��������ʱ������쳣��", "����΢�ŷ��ؽ��ʧ��!").outputXMLStr();
            } else {
                return returnXml.outputXMLStr();
            }

        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.debug(">>>�û���ѯʧ�ܣ���װ����ʧ�ܣ�" + e.fillInStackTrace());
            return uigXmlMgr.initErrorXML(entity, "0009", "���˻��������ʱ������쳣��", e.getMessage()).outputXMLStr();
        }
    }

    /**
     * �ǿ���֤,���ҰѲ�Ϊ�յĿɿ��ֶ���ӵ�map��
     * <p>
     * [������ϸ����]
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
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0004", "�ؼ�����Ϊ��", "total_fee����Ϊ��").outputXMLStr());
            return false;
        } else {
            dataMap.put("total_fee", total_fee);
        }
        String product_code = requestMap.get("product_code");
        if (StringTools.isEmpty(product_code)) {
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0004", "�ؼ�����Ϊ��", "product_code����Ϊ��").outputXMLStr());
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
        // ���ַ���ת��ΪXML�ĵ�����
        Document document = DocumentHelper.parseText(response);
        // ����ĵ��ĸ��ڵ�
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
