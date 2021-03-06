package com.victor.service.impl;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.dom4j.Element;
import org.springframework.stereotype.Service;

import com.victor.mapper.AlipayStoreInfoMapper;
import com.victor.pojo.AlipayOrderEntity;
import com.victor.pojo.AlipayStoreInfo;
import com.victor.service.CommonService;
import com.victor.util.LogUtil;
import com.victor.util.StringTools;
import com.victor.util.UigXmlMgr;


/**
 * 公共方法<p>
 * [功能详细描述]<p>
 *
 * @author victor
 * @version 1.0, 2015-7-16
 * @see
 * @since V1.0
 */
@Service("commonService")
public class CommonServiceImpl implements CommonService {

    @Resource
    private AlipayStoreInfoMapper alipayStoreInfoMapper;

    @Resource
    private UigXmlMgr uigXmlMgr;

    public boolean validateRequest(Map<String, Object> requestMap, AlipayOrderEntity entity) {
        try {
            // 信息:
            // 127.0.0.1发送的URL请求串内容是：/JsZshService.uig?version=1.0.1&instId=1000203&type=QGGReq&msgId=&msgTime=20090601010101&billKey=65429345&commodityId=10040125002501&sign=06ddfd8f956e4b7f78d2841614882ece
            // 得到请求MAP对
            LogUtil.debug("【支付宝接口请求验证】validateRequest begin：requestMap=" + requestMap);
            AlipayStoreInfo alipayStoreInfo = new AlipayStoreInfo();
            String type = String.valueOf(requestMap.get("type"));
            if (StringTools.isNotEmpty(type)) {
                entity.setType(type);
            } else {
                LogUtil.debug("【支付宝接口请求验证】type参数为空");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0004",
                        "【支付宝接口请求验证】关键数据为空", "type参数为空").outputXMLStr());
                return false;
            }
            String brandid = String.valueOf(requestMap.get("brandid"));
            if (StringTools.isNotEmpty(brandid)) {
                entity.setBrandid(brandid);
                alipayStoreInfo.setBrandid(brandid);
            } else {
                LogUtil.debug("【支付宝接口请求验证】brandid参数为空");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0004",
                        "【支付宝接口请求验证】关键数据为空", "brandid参数为空").outputXMLStr());
                return false;
            }
            String ouid =String.valueOf(requestMap.get("ouid"));
            if (StringTools.isNotEmpty(ouid)) {
                entity.setOuid(ouid);
                alipayStoreInfo.setOuid(ouid);
            } else {
                LogUtil.debug("【支付宝接口请求验证】ouid参数为空");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0004", "【支付宝接口请求验证】关键数据为空",
                        "ouid参数为空").outputXMLStr());
                return false;
            }

            String orgcode = String.valueOf(requestMap.get("orgcode"));
            if (StringTools.isNotEmpty(orgcode)) {
                entity.setOrgcode(orgcode);
                alipayStoreInfo.setOrgcode(orgcode);
            } else {
                LogUtil.debug("【支付宝接口请求验证】orgcode参数为空");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0004", "【支付宝接口请求验证】关键数据为空",
                        "orgcode参数为空").outputXMLStr());
                return false;
            }
            entity.setStorecode(String.valueOf(requestMap.get("storecode")));
            alipayStoreInfo.setStorecode(String.valueOf(requestMap.get("storecode")));

            List<AlipayStoreInfo> alipayStoreInfos = alipayStoreInfoMapper.queryAlipayPayInfo(alipayStoreInfo);
            if (alipayStoreInfos == null || alipayStoreInfos.size() != 1) {
                LogUtil.debug("【支付宝接口请求验证】请求对应的支付宝配置不唯一");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
                        "【支付宝接口请求验证】配置异常", "请求对应的支付宝配置不唯一！").outputXMLStr());
                return false;
            }
            alipayStoreInfo = alipayStoreInfos.get(0);
            String partner_key = alipayStoreInfo.getPartner_key();
            String partnerid = alipayStoreInfo.getPartnerid();
            String seller_email = alipayStoreInfo.getSeller_email();
            String actversion = alipayStoreInfo.getActversion();
            String act_name = alipayStoreInfo.getAct_name();
            String agentid = alipayStoreInfo.getAgentid();
            if (StringTools.isEmpty(partner_key)) {
                LogUtil.debug("【支付宝接口请求验证】支付宝对应的partner_key不存在");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
                        "【支付宝接口请求验证】关键数据为空", "支付宝对应的partner_key不存在！").outputXMLStr());
                return false;
            } else {
                entity.setPartner_key(partner_key);
            }

            if (StringTools.isEmpty(partnerid)) {
                LogUtil.debug("【支付宝接口请求验证】支付宝对应的partnerid不存在");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
                        "【支付宝接口请求验证】关键数据为空", "支付宝对应的partnerid不存在！").outputXMLStr());
                return false;
            } else {
                entity.setPartner(partnerid);
            }
            if (StringTools.isEmpty(seller_email)) {
                LogUtil.debug("【支付宝接口请求验证】支付宝对应的seller_email不存在");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
                        "【支付宝接口请求验证】关键数据为空", "支付宝对应的seller_email不存在！").outputXMLStr());
                return false;
            } else {
                entity.setSeller_email(seller_email);
            }
            if (StringTools.isEmpty(act_name)) {
                LogUtil.debug("【支付宝接口请求验证】act_name");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
                        "【支付宝接口请求验证】关键数据为空", "支付宝对应的act_name不存在！").outputXMLStr());
                return false;
            } else {
                entity.setAct_name(act_name);
                entity.setAgentid(agentid);
            }
            if (StringTools.isEmpty(actversion)) {
                LogUtil.debug("【支付宝接口请求验证】actversion不存在");
                entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
                        "【支付宝接口请求验证】关键数据为空", "支付宝对应的actversion不存在！").outputXMLStr());
                return false;
            } else {
                if ("V2.0".equals(actversion)){
                    String appid = alipayStoreInfo.getAppid();
                    if (StringTools.isEmpty(appid)) {
                        LogUtil.debug("【支付宝接口请求验证】appid为空");
                        entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
                                "【支付宝接口请求验证】关键数据为空", "支付宝对应的appid不存在！").outputXMLStr());
                        return false;
                    } else {
                        entity.setAppid(appid);
                    }
                    String private_key = alipayStoreInfo.getPrivate_key();
                    if (StringTools.isEmpty(private_key)) {
                        LogUtil.debug("【支付宝接口请求验证】private_key为空");
                        entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
                                "【支付宝接口请求验证】关键数据为空", "支付宝对应的private_key不存在！").outputXMLStr());
                        return false;
                    } else {
                        entity.setPrivate_key(private_key);
                    }
                }
                String newType = getMethodByVersion(actversion,type);
                if (newType==null){
                    LogUtil.debug("【支付宝接口请求验证】type字段传入错误！");
                    entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
                            "【支付宝接口请求验证】传入参数异常", "type字段传入错误！").outputXMLStr());
                    return false;
                }else {
                    entity.setType(newType);
                }
            }
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.debug("【支付宝接口请求验证】异常，Exception=" + e.getMessage());
            entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0009",
                    "【支付宝接口请求验证】异常。", e.getMessage()).outputXMLStr());
            return false;

        }
    }


    public UigXmlMgr returnResponseXml(UigXmlMgr headXml, UigXmlMgr zshResponse, AlipayOrderEntity entity) {

        try {

            headXml.addElement(zshResponse.m_Body, (Element) zshResponse.m_Alipay.clone());

            //加签
            uigXmlMgr.addElementSign(headXml, entity);

            return headXml;

        } catch (Exception e) {
            e.printStackTrace();
            return uigXmlMgr.initErrorXML(entity, "0009", "系统异常", "销账机构处理的时候出现异常。");

        }

    }

    public String getMethodByVersion(String actversion,String type){
        if ("V2.0".equals(actversion)){
            if ("alipayPayOrderReqServiceReq".equals(type)){
                return "alipayPayOrderReqServiceReqV2";
            }else if ("alipayQueryOrderReq".equals(type)){
                return "alipayQueryOrderReqV2";
            }else if ("alipayRefundOrderReqServiceReq".equals(type)){
                return "alipayRefundOrderReqServiceReqV2";
            }
        }else {
            return type;
        }
		return null;

    }

}
