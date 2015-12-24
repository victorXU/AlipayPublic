package com.victor.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.security.KeyStore;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.BasicHttpParams;

import szwx855.base.BaseGlobal;
import szwx855.base.xml.BaseUigMgr;
import szwx855.base.xml.BaseUigURLManager;
import szwx855.base.xml.BaseUigXmlMgr;
import org.apache.http.entity.StringEntity;
import org.apache.http.HttpVersion;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HTTP;

public class UigXmlPost implements BaseUigMgr {
	private UigURLManager uum;
	private UigXmlMgr uigXmlMgr;

	public UigURLManager getUum() {
		return this.uum;
	}

	public void setUum(UigURLManager uum) {
		this.uum = uum;
	}

	public UigXmlMgr getUigXmlMgr() {
		return this.uigXmlMgr;
	}

	public void setUigXmlMgr(UigXmlMgr uigXmlMgr) {
		this.uigXmlMgr = uigXmlMgr;
	}

	public BaseUigXmlMgr post(BaseUigURLManager arg0, BaseUigXmlMgr inBxm,
			StringBuffer arg3) {
		String url = arg0.getUrl();
		String aRequestContent = inBxm.outputXMLStr();

		if ((aRequestContent != null) && (aRequestContent.length() > 0)) {
			PostMethod post = new PostMethod(url);
			post.setRequestBody(aRequestContent);
			post.setRequestHeader("Content-type", "text/xml; charset=UTF-8");
			try {
				HttpClient httpclient = new HttpClient();
				HttpClientChacterUtil.setChacterIsUTF(httpclient);
				
				logger.info("url-> " + url);
				logger.info("inXml-> " + aRequestContent);
				System.out.println("url-> " + url);
				System.out.println("inXml-> " + aRequestContent);
				int result = httpclient.executeMethod(post);
				if (200 == result) {
					System.out.println("outXml-> "
							+ post.getResponseBodyAsString());
					logger.info("outXml-> " + post.getResponseBodyAsString());
					BaseUigXmlMgr localBaseUigXmlMgr = parseWebXml(
							inBxm.parseXml_uig(post.getResponseBodyAsString()),
							arg3);
					return localBaseUigXmlMgr;
				}
				System.out.println("Http return code is::-->" + result);
				return null;
			} catch (Exception localException) {
			} finally {
				if (post != null)
					post.releaseConnection();
			}
		}
		return null;
	}
	
	
	
	/**
	 * 
	 * 
	 * @author      : �ֽ�
	 * @createTime  : 2012-3-15
	 * @version     : 1.0 
	 * @comments    : ��д����
	 * @params	    : ���ͱ���
	 * @return	    :
	 * @requestNum  : 
	 * @documentPath:
	 */
	public String post(String url,UigXmlMgr inBxm) {
		
		//test begin:
		
		/*
		String xml1 = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>"+
		"<OPERATION_OUT>"+
		"	<RESPONSE>"+
		"		<RESP_CODE>0</RESP_CODE>"+
		"		<RESP_DESC/>"+
		"	</RESPONSE>"+
		"	<CONTENT>"+
		"	<STATE></STATE>"+
		"	<DESC></DESC>"+
		"		<ACCOUNT_INFO>"+
		"		<ORDER_ID></ORDER_ID>"+
		"			<ACCOUNT>142222221</ACCOUNT>"+
		"			<AMOUNT></AMOUNT>"+
		"			<UNIT>1</UNIT>"+
		"			<ADDRESS></ADDRESS>"+
		"			<USER_NAME></USER_NAME>"+
		"			<MONTH>20120405</MONTH>"+
		"			<TOTAL>250</TOTAL>"+
		"			<PEAK_VALUE>0512</PEAK_VALUE>>"+
		"			<VALLEY_VALUE>1103</VALLEY_VALUE>"+
		"			<ADDRESS>�Ͼ�</ADDRESS>"+
		"			<GROSS_VALUE>1</GROSS_VALUE>"+
		"		</ACCOUNT_INFO>"+
		"	</CONTENT>"+
		"</OPERATION_OUT>";
		
		String xml2 = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><OPERATION_OUT><RESPONSE><RESP_CODE>-8404</RESP_CODE><RESP_DESC>��ѯ�ɷ����ڴ���20120304,ֻ֧�ֲ�ѯ�ϸ��µ�Ƿ�ѡ�</RESP_DESC></RESPONSE></OPERATION_OUT>";
		return xml2.trim();
		//test end;
		*/
		
		String aRequestContent = inBxm.outputXMLStr();
		
		if (aRequestContent != null && aRequestContent.length() > 0) {
			PostMethod post = new PostMethod(url);
			post.setRequestBody(aRequestContent);
			post.setRequestHeader("Content-type", "text/xml; charset=UTF-8");

			try { 

				HttpClient httpclient = new HttpClient();
				HttpClientChacterUtil.setChacterIsUTF(httpclient);
				
				logger.info("լ�������: "+aRequestContent); 
				int result = httpclient.executeMethod(post);
				if (HttpStatus.SC_OK == result) {
					logger.info("լ����ر���: "+post.getResponseBodyAsString());
					return post.getResponseBodyAsString();
				} else {
					System.out.println("Http return code is::-->" + result);
					return null;
				}
			} catch (Exception e) {

				e.printStackTrace();
				return null;
				
			} finally {
				if (null != post)
					post.releaseConnection();
			}
		}
		
		return null;
		
	}
	
	

	/**
	 * 
	 * Copyright (c) 2013  ����լ���� All rights reserved
	 * 
	 * @author : �ֽ�
	 * @createTime : 2013-7-26
	 * @version : 1.0
	 * @comments : 
	 * @params : ֧�������������á�
	 * @return :
	 * @requestNum :
	 * @documentPath:
	 */
	public String post(String url,String str,String charset,HttpClient httpclient) {
		String aRequestContent = str;

		if ((aRequestContent != null) && (aRequestContent.length() > 0)) {
			PostMethod post = new PostMethod(url);
			post.setRequestBody(aRequestContent);
			//post.setRequestHeader("Content-type", "text/xml; charset=UTF-8");
			//post.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			post.setRequestHeader("Content-type", charset);
			try {
				
				
				logger.info("լ����͵ı���Ϊ��" + aRequestContent);
				System.out.println("լ����͵ı���Ϊ��" + aRequestContent);
				int result = httpclient.executeMethod(post);
				if (200 == result) {
					System.out.println("֧�������صı���Ϊ��" + post.getResponseBodyAsString());
					logger.info("֧�������صı���Ϊ��" + post.getResponseBodyAsString());
					return post.getResponseBodyAsString();
				}
				return null;
			} catch (Exception localException) {
			
			} finally {
				if (post != null)
					post.releaseConnection();
			}
		}
		return null;
	}
	
	
	

	/**
	 * 
	 * Copyright (c) 2013  ����լ���� All rights reserved
	 * 
	 * @author : �ֽ�
	 * @createTime : 2013-7-26
	 * @version : 1.0
	 * @comments : �����ֻ�������ѯ
	 * @params :
	 * @return :
	 * @requestNum :
	 * @documentPath:
	 */
	public String postGY(String url,String str) {
		String aRequestContent = str;

		if ((aRequestContent != null) && (aRequestContent.length() > 0)) {
			PostMethod post = new PostMethod(url);
			post.setRequestBody(aRequestContent);
			post.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=gb2312");
			try {
				HttpClient httpclient = new HttpClient();
				HttpClientChacterUtil.setChacterIsUTF(httpclient);
				
				logger.info("լ�������ֻ������ز�ѯ����Ϊ��" + aRequestContent);
				System.out.println("լ�������ֻ������ز�ѯ����Ϊ��" + aRequestContent);
				int result = httpclient.executeMethod(post);
				if (200 == result) {
					System.out.println("�������ֻ������ز�ѯ���ر���Ϊ��" + post.getResponseBodyAsString());
					logger.info("�������ֻ������ز�ѯ���ر���Ϊ��" + post.getResponseBodyAsString());
					return post.getResponseBodyAsString();
				}
				return null;
			} catch (Exception localException) {
			
			} finally {
				if (post != null)
					post.releaseConnection();
			}
		}
		return null;
	}
	
	

	public BaseUigXmlMgr postGYGAME(BaseUigURLManager arg0, StringBuffer arg2,
			StringBuffer arg3) {
		String url = arg0.getUrl();
		String aRequestContent = arg2.toString();
		PostMethod post = new PostMethod(url);
		
		try {
			if ((aRequestContent != null) && (aRequestContent.length() > 0)) {
				post.setRequestBody(aRequestContent);
				post.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=gb2312");
				
				HttpClient httpclient = new HttpClient();
				HttpClientChacterUtil.setChacterIsGbk(httpclient);
				httpclient.setConnectionTimeout(6000);
				System.out.println("url-> " + url);
				System.out.println("inXml-> " + aRequestContent);
				int result = httpclient.executeMethod(post);
				if (200 == result) {
					String response = post.getResponseBodyAsString();
					System.out.println("outXml-> "+ response);
					BaseUigXmlMgr localBaseUigXmlMgr = new UigXmlMgr();
					localBaseUigXmlMgr.parseXml(response.substring(0,response.length()-32));
					return localBaseUigXmlMgr;
				}
				System.out.println("Http return code is::-->" + result);
				return null;
			}else{
				
				return null;
			}
		} catch (Exception localException) {
			localException.printStackTrace();
			return null;
		} finally {
			if (post != null)
				post.releaseConnection();
		}
		
	}
	
	
	public BaseUigXmlMgr parseWebXml(BaseUigXmlMgr outBxm, StringBuffer arg1) {
		int nRet = 0;
		try {
			String strDesc = outBxm.getElementStringValue(outBxm.m_Response,
					BaseGlobal.RES_DESC);
			String strCode = outBxm.getElementStringValue(outBxm.m_Response,
					BaseGlobal.RES_CODE);
			if ("0".equals(strCode)) {
				outBxm.m_Content = outBxm.getElement(outBxm.m_rootElement,
						BaseGlobal.RES_CONTENT);
				
			}

			return outBxm;
		} catch (Exception e) {
			e.printStackTrace();
			logger.error(e.getMessage());
		}
		return null;
	}

	public String postCGI(BaseUigURLManager arg0, String sendData) {
		String url = arg0.getUrl();
		String aRequestContent = sendData;
		StringBuffer sbResult = new StringBuffer();

		if ((aRequestContent != null) && (aRequestContent.length() > 0)) {
			PostMethod post = new PostMethod(url);
			post.setRequestBody(aRequestContent);
			try {
				HttpClient httpclient = new HttpClient();
				HttpClientChacterUtil.setChacterIsUTF(httpclient);
				logger.info("url-> " + url);
				logger.info("inXml-> " + aRequestContent);
				int result = httpclient.executeMethod(post);
				if (200 == result) {
					//System.out.println("Response body: ");
					String str1 = post.getResponseBodyAsString();
					logger.info("outXml -> "+str1);
					return str1;
				}
				
				return null;
			} catch (Exception localException) {
			} finally {
				if (post != null)
					post.releaseConnection();
			}
		}
		return null;
	}
	
	
	/**
     * ������Ӧ���ĸ�������.
     * 
     * @param response
     *            response
     * @param xml
     *            ��Ӧ����
     * @throws IOException
     */
    public static void sendMessage(HttpServletResponse response, String xml) {
        // ׼����Ӧ����
        response.addHeader("Content-Type", "text/xml;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        PrintWriter writer;
        
        try {
            writer = response.getWriter();
            writer.write(xml);
        } catch (IOException e) {
            logger.error("�ڷ�����Ӧ����ʱ����", e);
        }
    }

	/* (non-Javadoc)
	 * @see szwx855.base.xml.BaseUigMgr#postGY(szwx855.base.xml.BaseUigURLManager, java.lang.StringBuffer, java.lang.StringBuffer)
	 */
	public BaseUigXmlMgr postGY(BaseUigURLManager paramBaseUigURLManager,
			StringBuffer paramStringBuffer, StringBuffer errorMessage) {
		// TODO Auto-generated method stub
		return null;
	}
    
	/*public String postSY(BaseUigURLManager arg0, String sendData) {
		String url = arg0.getUrl();
		String aRequestContent = sendData;

		if ((aRequestContent != null) && (aRequestContent.length() > 0)) {
			org.apache.http.client.HttpClient httpclient=getNewHttpClient();
	        //���HttpPOST����
	    	HttpPost request = new HttpPost(url); 
	    	
	    	try { 

	    		  StringEntity params =new StringEntity(aRequestContent,"UTF-8");  
				  request.addHeader("content-type", "application/json");  
				  request.setEntity(params); 
				  // ��������
				  HttpResponse response = httpclient.execute(request);
				  int resultCode = response.getStatusLine().getStatusCode();
				  if (200 == resultCode) {
						//System.out.println("Response body: ");
					  InputStream is = response.getEntity().getContent();
					  BufferedReader in = new BufferedReader(new InputStreamReader(is,"UTF-8"));  
					  StringBuffer sb = new StringBuffer();  
					  String data = null;  
					  while((data = in.readLine())!=null){  
					      sb.append(data);  
					  }  
					  if(in != null)  
					      in.close(); 
						logger.info("outXml -> "+sb);
						return sb.toString();
					}
				
			  }catch (Exception e) {  
				  e.printStackTrace();
			  } finally {  
			    	httpclient.getConnectionManager().shutdown();  
			  }  
		}
		return null;
	}
	
	public  DefaultHttpClient getNewHttpClient() {
		try {
			KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
			trustStore.load(null, null);

			SSLSocketFactory sf = new SSLSocketFactoryEx(trustStore);
			sf.setHostnameVerifier(SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);

			HttpParams params = new BasicHttpParams();
			HttpProtocolParams.setVersion(params, HttpVersion.HTTP_1_1);
			HttpProtocolParams.setContentCharset(params, HTTP.UTF_8);

			SchemeRegistry registry = new SchemeRegistry();
			registry.register(new Scheme("http", PlainSocketFactory.getSocketFactory(), 80));
			registry.register(new Scheme("https", sf, 443));

			ClientConnectionManager ccm = new ThreadSafeClientConnManager(params, registry);

			return new DefaultHttpClient(ccm, params);
		} catch (Exception e) {
			return new DefaultHttpClient();
		}
    }	*/
    
}

