 package com.victor.util;

 import com.victor.pojo.AlipayOrderEntity;
 import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;
import org.springframework.stereotype.Component;

import szwx855.base.dt.UigHeadDT;
import szwx855.base.xml.BaseUigXmlMgr;


@Component("uigXmlMgr")
public class UigXmlMgr extends BaseUigXmlMgr {
	

	public Element m_Message;
	
	public Element m_Body;
	
	public Element m_cancelBody;
	
	public Element m_cancelMessage;
	
	public Element m_Head;
	
	public Element m_Acc;
	
	public Element m_Alipay;
	
	
	
	private MD5 md5 = new MD5();

	
	//封装宅生活发送报文头。
	public void initXML(UigHeadDT dt) {
		this.m_sEncoding = ZshConfig.UTF_8;
		this.m_Document = DocumentHelper.createDocument();
		this.m_rootElement = this.m_Document.addElement("OPERATION_IN");
		try {
			addElement(this.m_rootElement, "SERVER_FUCTION_ID",
					dt.getSERVER_FUCTION_ID());
			addElement(this.m_rootElement, "REQUEST_TIME",
					DateUtil.getNowString());
			addElement(this.m_rootElement, "RESP_TIME", DateUtil.getNowString());

			Element tmp = addElement(this.m_rootElement, "OPERATOR_ENV");

			addElement(tmp, "PLATE_CODE", dt.getPLATE_CODE());
			addElement(tmp, "OPER_ID", dt.getOPER_ID());
			addElement(tmp, "OPER_NAME", dt.getOPER_NAME());
			addElement(tmp, "OPER_FUNC_ID", dt.getOPER_FUNC_ID());

			this.m_Content = addElement(this.m_rootElement, "CONTENT");

		} catch (Exception localException) {
		}
	}
	
	
	
	
	/**
	 * 
	 * 
	 * Copyright (c) 2012, 江苏宅生活 All rights reserved
	 * @author      : 林健
	 * @createTime  : 2012-5-5
	 * @version     : 1.0 
	 * @comments    : 返回第三方错误报文(有密钥的情况)
	 * @params	    :
	 * @return	    :
	 * @requestNum  : 
	 * @documentPath:
	 */
	public UigXmlMgr initErrorXML(AlipayOrderEntity body,String errorCode,String errorMessage,String errorDetails) {
		try {
				
			this.m_sEncoding = ZshConfig.UTF_8; 
			this.m_Document = DocumentHelper.createDocument();
			this.m_Document.setXMLEncoding(this.m_sEncoding);
			this.m_Message = m_Document.addElement("message");
			this.m_rootElement = m_Document.getRootElement();
			this.m_Head = m_Message.addElement("head");
			this.m_Body = m_Message.addElement("body");
				
			addElement(m_Head, "version", body.getVersion());
			addElement(m_Head, "type", "Error");
			addElement(m_Head, "instId",body.getInstId());
			addElement(m_Head, "msgTime", body.getMsgTime());
			addElement(m_Head, "msgId", body.getMsgId());
			
			addElement(m_Body, "errorCode",new String(errorCode.getBytes("GBK")));
			addElement(m_Body, "errorMessage",new String(errorMessage.getBytes("GBK")));
			addElement(m_Body, "errorDetails",new String(errorDetails.getBytes("GBK")));
			addElement(m_Head, "sign","");
			
			addElementSign(this,body);
			
			return this;
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
		
	}
	
	
	/**
	 * 
	 * 
	 * Copyright (c) 2012, 江苏宅生活 All rights reserved
	 * @author      : 林健
	 * @createTime  : 2012-5-5
	 * @version     : 1.0 
	 * @comments    : 返回第三方错误报文(有密钥的情况)
	 * @params	    :
	 * @return	    :
	 * @requestNum  : 
	 * @documentPath:
	 */
	public UigXmlMgr initErrorPayXML(AlipayOrderEntity body,String errorCode,String errorMessage,String errorDetails) {
		try {
			
			this.m_sEncoding = ZshConfig.UTF_8; 
			this.m_Document = DocumentHelper.createDocument();
			this.m_Document.setXMLEncoding(this.m_sEncoding);
			this.m_Message = m_Document.addElement("message");
			this.m_rootElement = m_Document.getRootElement();
			this.m_Head = m_Message.addElement("head");
			this.m_Body = m_Message.addElement("body");
			
			addElement(m_Head, "version", body.getVersion());
			addElement(m_Head, "type", "Error");
			addElement(m_Head, "instId",body.getInstId());
			addElement(m_Head, "msgTime", body.getMsgTime());
			addElement(m_Head, "msgId", body.getMsgId());
			
			addElement(m_Body, "errorCode",new String(errorCode.getBytes("GBK")));
			addElement(m_Body, "errorMessage",new String(errorMessage.getBytes("GBK")));
			addElement(m_Body, "errorDetails",new String(errorDetails.getBytes("GBK")));
			addElement(m_Head, "sign","");
			
			addElementSign(this,body);
			
			return this;
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
		
	}
	
	
	/**
	 * 
	 * Copyright (c) 2013  江苏宅生活 All rights reserved
	 * 
	 * @author : 林健
	 * @createTime : 2013-7-25
	 * @version : 1.0
	 * @comments : 进行报文签名
	 * @params :
	 * @return :
	 * @requestNum :
	 * @documentPath:
	 */
	public void addElementSign(UigXmlMgr uigXmlMgr,AlipayOrderEntity body){
		
		try {
			
			//第一次加密 ：
			String oneMd5 = md5.encode(uigXmlMgr.m_Document.asXML().replaceAll("\\n|\r", ""),ZshConfig.UTF_8);
			
			//第二次加密：
			String secondMd5 = body.getPrivateKey()+oneMd5+body.getPrivateKey();
			String sign = md5.encode(secondMd5,ZshConfig.UTF_8);
			uigXmlMgr.m_Document.selectSingleNode("/message/head/sign").setText(sign); 
			
		
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	
	/**
	 * 
	 * Copyright (c) 2013  江苏宅生活 All rights reserved
	 * 
	 * @author : 林健
	 * @createTime : 2013-7-25
	 * @version : 1.0
	 * @comments : 进行报文签名
	 * @params :
	 * @return :
	 * @requestNum :
	 * @documentPath:
	 */
	public void addElementSignNoKey(UigXmlMgr uigXmlMgr){
		
		try {
			
			//第一次加密 ：
			String oneMd5 = md5.encode(uigXmlMgr.m_Document.asXML().replaceAll("\\n|\r", ""),ZshConfig.UTF_8);
			
			//第二次加密：
			String secondMd5 = ""+oneMd5+"";
			String sign = md5.encode(secondMd5,ZshConfig.UTF_8);
			
			uigXmlMgr.m_Document.selectSingleNode("/message/head/sign").setText(sign); 
			
		
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	
	
	/**
	 * 
	 * 
	 * Copyright (c) 2012, 江苏宅生活 All rights reserved
	 * @author      : 林健
	 * @createTime  : 2012-5-5
	 * @version     : 1.0 
	 * @comments    : 返回第三方错误报文(无密钥的情况)
	 * @params	    :
	 * @return	    :
	 * @requestNum  : 
	 * @documentPath:
	 */
	public UigXmlMgr initErrorXMLNoKey(AlipayOrderEntity body,String errorCode,String errorMessage,String errorDetails) {
		try {
			
			this.m_sEncoding = ZshConfig.UTF_8; 
			this.m_Document = DocumentHelper.createDocument();
			this.m_Message = m_Document.addElement("message");
			this.m_rootElement = m_Document.getRootElement();
			this.m_Head = m_Message.addElement("head");
			this.m_Body = m_Message.addElement("body");
				
			addElement(m_Head, "version", body.getVersion());
			addElement(m_Head, "type", "Error");
			addElement(m_Head, "instId",body.getInstId());
			addElement(m_Head, "msgTime", body.getMsgTime());
			addElement(m_Head, "msgId", body.getMsgId());
			addElement(m_Head, "sign", "");
			
			addElement(m_Body, "errorCode",new String(errorCode.getBytes("GBK")));
			addElement(m_Body, "errorMessage",new String(errorMessage.getBytes("GBK")));
			addElement(m_Body, "errorDetails",new String(errorDetails.getBytes("GBK")));
			
			addElementSignNoKey(this);
			return this;
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
		
	}
	
	
	/**
	 * 
	 * 
	 * Copyright (c) 2012, 江苏宅生活 All rights reserved
	 * @author      : 林健
	 * @createTime  : 2012-5-5
	 * @version     : 1.0 
	 * @comments    : 封装宅生活对外的报文头数据。
	 * @params	    :
	 * @return	    :
	 * @requestNum  : 
	 * @documentPath:
	 */
	public UigXmlMgr headResponseXml(AlipayOrderEntity body) throws Exception {
		
		this.m_sEncoding = ZshConfig.UTF_8; 
		this.m_Document = DocumentHelper.createDocument();
		this.m_rootElement = m_Document.getRootElement();
		this.m_Message = m_Document.addElement("message");
		this.m_Head = m_Message.addElement("head");
		this.m_Body = m_Message.addElement("body");
			
		addElement(m_Head, "version", body.getVersion());
		addElement(m_Head, "type", "");
		addElement(m_Head, "instId",body.getInstId());
		addElement(m_Head, "msgTime", body.getMsgTime());
		addElement(m_Head, "msgId", body.getMsgId());
		addElement(m_Head, "sign", "");
		
		String type = body.getType();
		if("SonicReq".equals(type)){
			type="SonicRes";	
		}else if("SonicPreReq".equals(type)){
			type="SonicPreRes";	
		}else if("SonicQueryReq".equals(type)){
		    type="SonicQueryReq";
		}else if("SonicQueryRes".equals(type)){
			 type="SonicQueryRes";
		}else if("SonicRefundReq".equals(type)){
			type="SonicRefundRes";	
		}else if("SonicCloseReq".equals(type)){
		    type="SonicCloseRes";
		}else if("SonicCancelReq".equals(type)){
			 type="SonicCancelRes";	 
		}else if("SonicBGGCancelReq".equals(type)){
			type="SonicBGGCancelRes";
		}else if("StudentQueryReq".equals(type)){
			type="StudentQueryRes";
		
		}else if("StudentPaymentReq".equals(type)){
			type="StudentPaymentRes";
		
		}else if("SonicQueryInfoReq".equals(type)){
			type="SonicQueryInfoRes";
		
		}else if("yifubaoPreReq".equals(type)){
			type="yifubaoPreRes";
		
		}else if("yifubaoQueryMerchantReq".equals(type)){
			type="yifubaoQueryMerchantRes";
		
		}else if("weixinUnifiedOrderReq".equals(type)){
			type="weixinUnifiedOrderRes";
			
		}else if("weixinQueryOrderRep".equals(type)){
			type="weixinQueryOrderRes";
			
		}else{
			type="Error";
		}
		
		m_Document.selectSingleNode("/message/head/type").setText(type);
		return this;
	}

	/**
	 * 
	 * 
	 * Copyright (c) 2012, 江苏宅生活 All rights reserved
	 * @author      : 林健
	 * @createTime  : 2012-5-5
	 * @version     : 1.0 
	 * @comments    : 解析宅生活返回的XML数据，封装成UigXmlMgr对象。
	 * @params	    :
	 * @return	    :
	 * @requestNum  : 
	 * @documentPath:
	 */
	public UigXmlMgr parseXmlForZsh(String strXml) throws Exception {
		//strXml = transGbk(strXml);
		try {
			m_Document = DocumentHelper.parseText(strXml);
		} catch (DocumentException e) {
			String strXml_new = filterIllegalChar(strXml);
			try {
				m_Document = DocumentHelper.parseText(strXml_new);
			} catch (DocumentException de) {
				de.printStackTrace();
				throw new Exception(de);
			}
		}
		m_Document.setXMLEncoding(ZshConfig.UTF_8);
		m_rootElement = m_Document.getRootElement();//m_root为xml第一个元素节点 
		m_Response = m_rootElement.element("RESPONSE");
		m_Content = m_rootElement.element("CONTENT");
		m_sEncoding = m_Document.getXMLEncoding();
		return this;
	}
	
	
	/**
	 * 
	 * 
	 * Copyright (c) 2012, 江苏宅生活 All rights reserved
	 * @author      : 林健
	 * @createTime  : 2012-5-5
	 * @version     : 1.0 
	 * @comments    : 解析宅生活返回的XML数据，封装成UigXmlMgr对象。
	 * @params	    :
	 * @return	    :
	 * @requestNum  : 
	 * @documentPath:
	 */
	public UigXmlMgr parseXmlForZshII(String strXml) throws Exception {
		//strXml = transGbk(strXml);
		try {
			m_Document = DocumentHelper.parseText(strXml);
		} catch (DocumentException e) {
			String strXml_new = filterIllegalChar(strXml);
			try {
				m_Document = DocumentHelper.parseText(strXml_new);
			} catch (DocumentException de) {
				de.printStackTrace();
				throw new Exception(de);
			}
		}
		m_Document.setXMLEncoding(ZshConfig.UTF_8);
		m_cancelMessage = m_Document.getRootElement();//m_root为xml第一个元素节点 
		m_cancelBody = m_cancelMessage.element("body");
		m_Alipay = m_cancelBody.element("alipay");
		m_sEncoding = m_Document.getXMLEncoding();
		return this;
	}
	
	
	
	/**
	 * 
	 * 
	 * Copyright (c) 2012, 江苏宅生活 All rights reserved
	 * @author      : 林健
	 * @createTime  : 2012-5-5
	 * @version     : 1.0 
	 * @comments    : 解析支付宝报文
	 * @params	    :
	 * @return	    :
	 * @requestNum  : 
	 * @documentPath:
	 */
	public UigXmlMgr parseXmlForAlipay(String strXml) throws Exception {
		//strXml = transGbk(strXml);
		try {
			m_Document = DocumentHelper.parseText(strXml);
		} catch (DocumentException e) {
			String strXml_new = filterIllegalChar(strXml);
			try {
				m_Document = DocumentHelper.parseText(strXml_new);
			} catch (DocumentException de) {
				de.printStackTrace();
				throw new Exception(de);
			}
		}
		m_Document.setXMLEncoding(ZshConfig.GBK);
		m_Alipay = m_Document.getRootElement();//m_root为xml第一个元素节点 
		m_Response = m_Alipay.element("response");
		m_sEncoding = m_Document.getXMLEncoding();
		return this;
	}
	
	
	/**
	 * 
	 * 
	 * Copyright (c) 2012, 江苏宅生活 All rights reserved
	 * @author      : 林健
	 * @createTime  : 2012-5-5
	 * @version     : 1.0 
	 * @comments    : 解析宅生活返回的XML数据，封装成UigXmlMgr对象。
	 * @params	    :
	 * @return	    :
	 * @requestNum  : 
	 * @documentPath:
	 */
	public UigXmlMgr parseXmlForGY(String strXml) throws Exception {
		//strXml = transGbk(strXml);
		try {
			m_Document = DocumentHelper.parseText(strXml);
		} catch (DocumentException e) {
			String strXml_new = filterIllegalChar(strXml);
			try {
				m_Document = DocumentHelper.parseText(strXml_new);
			} catch (DocumentException de) {
				de.printStackTrace();
				throw new Exception(de);
			}
		}
		m_Document.setXMLEncoding(ZshConfig.UTF_8);
		m_Acc = m_Document.getRootElement();//m_root为xml第一个元素节点 
		m_sEncoding = m_Document.getXMLEncoding();
		return this;
	}
	
	
	
	public void addElement(Element m_Father, Node strSonName)
			throws Exception {
		String strMsg;
		try {
			m_Father.add(strSonName);
			
		} catch (Exception e) {
			strMsg = "addElement error:sonName=" + strSonName + ",errMsg="
					+ e.getMessage();
		}
		
	}
	
	
	public static void main(String args[]){
		
		String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><message><head><version/><type>SonicCancelRes</type><instId>10008</instId><msgTime>20140320143503</msgTime><msgId/><sign>c5538508a2676a7457acd2e54dadadb0</sign></head><body><alipay><is_success>T</is_success><request><param name=\"sign\">3ce3e65c2f7d78490681a9f83c0da773</param><param name=\"_input_charset\">GBK</param><param name=\"sign_type\">MD5</param><param name=\"service\">alipay.acquire.cancel</param><param name=\"partner\">2088201565141845</param><param name=\"out_trade_no\">20140319113639839</param></request><response><alipay><out_trade_no>20140319113639839</out_trade_no><result_code>SUCCESS</result_code><retry_flag>N</retry_flag></alipay></response><sign>8de5efd328e5a8a529db1bb0ddb00dc4</sign><sign_type>MD5</sign_type></alipay></body></message>";
		try {
			Document root = DocumentHelper.parseText(xml);
			Element message = root.getRootElement();
			Element body = message.element("body");
			System.out.println(body);
			
		} catch (DocumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
}
