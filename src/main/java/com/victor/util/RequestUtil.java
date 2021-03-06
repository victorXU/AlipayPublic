/**
 * Alipay.com Inc.
 * Copyright (c) 2004-2014 All Rights Reserved.
 */
package com.victor.util;

import com.crop.web.util.UserUtils;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;
import org.springframework.test.util.ReflectionTestUtils;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URLDecoder;
import java.net.UnknownHostException;
import java.util.*;
import java.util.Map.Entry;


/**
 * 解析HttpServletRequest参数
 *
 * @author taixu.zqq
 * @version $Id: RequestUtil.java, v 0.1 2014年7月23日 上午10:48:10 taixu.zqq Exp $
 */
public class RequestUtil {

    public static Logger logger = Logger.getLogger("WEB-APP");   //日志记录

    /**
     * 获取所有request请求参数key-value
     *
     * @param request
     * @return
     */
    public static Map<String, Object> getRequestParams(HttpServletRequest request) {

        Map<String, Object> params = new HashMap<String, Object>();
        if (null != request) {
            Set<String> paramsKey = request.getParameterMap().keySet();
            System.out.println("--->>>--str-<<<--->>" + request.getParameterMap().values());
            if (paramsKey != null)
                System.out.println("count of params :" + paramsKey.size());
            Map<String,Object[]> paramMap = request.getParameterMap();
            for (String key : paramMap.keySet()) {
                params.put(key, paramMap.get(key)[0]);
            }
        }
        return params;
    }

    public static Map<String, Object> orderSendBefore(Map<String, Object> map) {

        Map<String, Object> treeMap = new TreeMap<String, Object>() {

            private static final long serialVersionUID = 1L;

            public String toString() {

                Iterator<Entry<String, Object>> iterator = this.entrySet().iterator();
                StringBuffer sb = new StringBuffer();
                while (iterator.hasNext()) {
                    Entry<String, Object> entry = iterator.next();
                    String key = entry.getKey();
                    Object value = entry.getValue();
                    sb.append(key + '=' + value + '&');
                }

                return sb.substring(0, sb.length() - 1).toString();
            }

        };

        treeMap.putAll(map);
        return treeMap;

    }

    public static Map<String, Object> orderForMap(Map<String, Object> map) {

        Map<String, Object> treeMap = new TreeMap<String, Object>() {

            private static final long serialVersionUID = 1L;

            public String toString() {

                Iterator<Entry<String, Object>> iterator = this.entrySet().iterator();
                StringBuffer sb = new StringBuffer();
                while (iterator.hasNext()) {
                    Entry<String, Object> entry = iterator.next();
                    String key = entry.getKey();
                    Object value = entry.getValue();
                    sb.append(key + '=' + value + '&');
                }

                return sb.substring(0, sb.length() - 1).toString();
            }

        };

        treeMap.putAll(map);
        return treeMap;

    }


    /**
     * post请求
     *
     * @param url   url地址
     * @param param 参数
     * @return
     */
    public static String post(String url, String param) {
        //post请求返回结果
        DefaultHttpClient client = new DefaultHttpClient();
        String str = "";
        HttpPost method = new HttpPost(url);
        try {
            if (null != param) {
                //解决中文乱码问题
                StringEntity entity = new StringEntity(param, "utf-8");
                entity.setContentEncoding("UTF-8");
//                entity.setContentType("application/json");
                method.setEntity(entity);
            }
            HttpResponse result = client.execute(method);
            url = URLDecoder.decode(url, "UTF-8");
            /**请求发送成功，并得到响应**/
            if (result.getStatusLine().getStatusCode() == 200) {

                try {
                    /**读取服务器返回过来的json字符串数据**/
                    str = EntityUtils.toString(result.getEntity());

                } catch (Exception e) {
                    logger.error("post请求提交失败:" + url, e);
                }
            }
        } catch (IOException e) {
            logger.error("post请求提交失败:" + url, e);
        }
        return str;
    }


    /**
     * 发送get请求
     *
     * @param url 路径
     * @return
     */
    public static String get(String url) {
        //get请求返回结果
        String result = null;
        try {
            DefaultHttpClient client = new DefaultHttpClient();
            //发送get请求
            HttpGet request = new HttpGet(url);
            HttpResponse response = client.execute(request);

            /**请求发送成功，并得到响应**/
            if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                /**读取服务器返回过来的json字符串数据**/
                result = EntityUtils.toString(response.getEntity());

                url = URLDecoder.decode(url, "UTF-8");
            } else {
                logger.error("get请求提交失败:" + url);
            }
        } catch (IOException e) {
            logger.error("get请求提交失败:" + url, e);
        }
        return result;
    }

    public static String getLocalIP() {
        InetAddress addr = null;
        try {
            addr = InetAddress.getLocalHost();
        } catch (UnknownHostException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        byte[] ipAddr = addr.getAddress();
        String ipAddrStr = "";
        for (int i = 0; i < ipAddr.length; i++) {
            if (i > 0) {
                ipAddrStr += ".";
            }
            ipAddrStr += ipAddr[i] & 0xFF;
        }
        // System.out.println(ipAddrStr);
        return ipAddrStr;
    }

    public static String getGUID() {
        UUID uuid = UUID.randomUUID();
        String uuStr = uuid.toString().replaceAll("-", "");
        System.out.println(uuStr);
        return uuStr;
    }

    public static Map<String, Object> getParamData() {
        return new HashMap<String, Object>() {
            private static final long serialVersionUID = 1L;

            {
//                put("brandid", UserUtils.getBrandId() + "");
//                put("ouid", UserUtils.getOuId() + "");
//                put("orgcode", UserUtils.getUserOrgId() + "");
//                put("storecode", UserUtils.getCurrentStoreCode());
//                put("userid", UserUtils.getLoginId());
//                put("username", UserUtils.getUserName());
//                put("usercode", UserUtils.getUserCode());
//                put("userip", UserUtils.getCurrentUserIp());
                put("brandid",  "111");
                put("ouid", "222");
                put("orgcode", "333");
                put("storecode", "444");
                put("userid", "2");
                put("username", "naca");
                put("usercode", "433");
                put("userip", "10.172.10.11");
            }
        };
    }

//    public String getOut_trade_no(){
//        BrandNoRule bnr = brandNoRuleService.findByBrandIdAndBusNoType(UserUtils.getBrandId(), BusNoType.ALIPAYORDER);
//        // 前缀
//        String prefix = UserUtils.getUserOrgCode();
//        // 是否有日期
//        boolean hasDate = bnr.isHasDate();
//        // 序号位数
//        int size = bnr.getSize();
//
//        NumberSenderRequest nrquest = new NumberSenderRequest();
//        nrquest.setBelongKey(bnr.getBrandId().toString());
//        nrquest.setSeqLength(size);
//        nrquest.setPrefixStr(prefix);
//        NumberSenderResponse resp = null;
//        String eventCode = "";
//        if (hasDate) {
//            resp = unifiedCodeGenerator.createCodeByDaily(nrquest);
//        } else {
//            resp = unifiedCodeGenerator.createCodeWithNoDate(nrquest);
//        }
//        if (resp != null && resp.getResultNoList() != null
//                && resp.getResultNoList().size() != 0) {
//            eventCode = resp.getResultNoList().get(0);
//        }
//        return eventCode;
//    }


    public static void main(String[] args) {
        getGUID();
        System.out.println("59a5f27a31134492a42fd682be0c3775".length());
    }
}
