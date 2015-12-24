package com.victor.util;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.params.HttpClientParams;


public class HttpClientChacterUtil {
	
	public static HttpClient setChacterIsUTF(HttpClient hc){
		
		HttpClientParams hp = new HttpClientParams();
		hp.setConnectionManagerTimeout(15000);
		hp.setContentCharset("UTF-8");
		hc.setParams(hp);
		hc.setConnectionTimeout(15000);
		hc.setTimeout(15000);
		return hc;
		
	}
	
	public static HttpClient setChacterIsGbk(HttpClient hc){
		
		HttpClientParams hp = new HttpClientParams();
		hp.setConnectionManagerTimeout(15000);
		hp.setContentCharset("GBK");
		hc.setParams(hp);
		hc.setConnectionTimeout(15000);
		hc.setTimeout(15000);
		return hc;
	}
}
