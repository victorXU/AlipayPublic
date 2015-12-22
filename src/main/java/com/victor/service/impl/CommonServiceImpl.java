package com.victor.service.impl;

import java.util.Map;

import javax.annotation.Resource;

import com.victor.mapper.AlipayStoreInfoMapper;
import com.victor.pojo.AlipayOrderEntity;
import com.victor.service.CommonService;
import com.victor.util.StringTools;
import com.victor.util.UigXmlMgr;
import org.dom4j.Element;
import org.springframework.stereotype.Service;


/**
 * 公共方法<p>
 * [功能详细描述]<p>
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

	public boolean validateRequest(Map<String, String> requestMap, AlipayOrderEntity entity) {
		try {
			// 信息:
			// 127.0.0.1发送的URL请求串内容是：/JsZshService.uig?version=1.0.1&instId=1000203&type=QGGReq&msgId=&msgTime=20090601010101&billKey=65429345&commodityId=10040125002501&sign=06ddfd8f956e4b7f78d2841614882ece
			// 得到请求MAP对
			String instId = requestMap.get("instId");
			if (StringTools.isNotEmpty(instId)) {
				entity.setInstId(instId);
			}else {
				entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0001",
						"机构标识不合法", "instId中填写的接收报文的机构的简称和约定的不一致").outputXMLStr());
			}
			String type = requestMap.get("type");
			if (StringTools.isNotEmpty(type)) {
				entity.setType(type);
			}else {
				entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0004", "关键数据为空",
						 "type参数为空").outputXMLStr());
			}
			
//			 读取instid对应的key
			Map<String, String> resultMap = alipayStoreInfoMapper.queryAlipayOrderInfo(entity.getInstId());
			if (resultMap == null || resultMap.size() == 0) {
				entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
						"id不存在", "instId对应的key不存在！").outputXMLStr());
				return false;
			}
			String privateKey=null;
			String partnerid =null;

			if (StringTools.isEmpty(privateKey)) {
				entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
						"privateKey不存在", "instId对应的私钥不存在！").outputXMLStr());
				return false;
			}else{
				entity.setPrivateKey(privateKey);
			}
			
			if (StringTools.isEmpty(partnerid)) {
				entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0007",
						"partnerid不存在", "instId对应的商户号不存在！").outputXMLStr());
				return false;
			}else{
				entity.setPartner(partnerid);
			}

			return true;

		} catch (Exception e) {
			e.printStackTrace();
			entity.setValidateResult(uigXmlMgr.initErrorXMLNoKey(entity, "0009",
					"销账机构处理的时候出现异常。", e.getMessage()).outputXMLStr());
			return false;

		}
	}


	public UigXmlMgr returnResponseXml(UigXmlMgr headXml,UigXmlMgr zshResponse,AlipayOrderEntity entity){

		try {

			headXml.addElement(zshResponse.m_Body, (Element)zshResponse.m_Alipay.clone());

			//加签
			uigXmlMgr.addElementSign(headXml, entity);

			return headXml;

		} catch (Exception e) {
			e.printStackTrace();
			return uigXmlMgr.initErrorXML(entity,"0009", "系统异常", "销账机构处理的时候出现异常。");

		}

	}

}
