import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import com.alibaba.fastjson.JSONArray;
import com.victor.util.*;
import org.apache.commons.httpclient.HttpClient;
import org.junit.Test;

/**
 * Created by Administrator on 2015/12/23.
 */
//@RunWith(SpringJUnit4ClassRunner.class)
//@ContextConfiguration(locations = "classpath:spring-config.xml")
public class TestInterface {

    @Test
    public void orderPayTest() {
        Map<String,Object> paramMap = RequestUtil.getParamData();
        paramMap.put("type","alipayPayOrderReqServiceReq");
        paramMap.put("product_code","BARCODE_PAY_OFFLINE");
        paramMap.put("notify_url", ZshConfig.CREATE_AND_PAY_NOTIFY_URL);
        paramMap.put("out_trade_no", "3402304823034812");
        paramMap.put("subject", "宅生活统一支付订单");
        paramMap.put("total_fee", "0.01");
        paramMap.put("price", "0.01");
        paramMap.put("quantity", "1");
        paramMap.put("dynamic_id", "a13734956c7ff649");
        String dataSend = RequestUtil.orderSendBefore(paramMap).toString();
        LogUtil.debug("【支付宝统一支付接口】请求内容：dataSend=" + dataSend);
        // ----------------------------发送到支付宝开始----------------------------
        UigXmlPost post = new UigXmlPost();
        HttpClient httpclient = new HttpClient();
        HttpClientChacterUtil.setChacterIsUTF(httpclient);
        String response = post.post(ZshConfig.INTERFACE_URL, dataSend,"application/x-www-form-urlencoded;text/html;charset=UTF-8",httpclient);
//        String response = RequestUtil.post(ZshConfig.INTERFACE_URL, dataSend);
        LogUtil.debug("【支付宝统一支付接口】返回结果：response=" + response);
    }

//    @Test
    public void orderQueryTest() {
        Map<String,Object> paramMap = RequestUtil.getParamData();
        paramMap.put("out_trade_no", "3402304823034812");
        paramMap.put("type","alipayQueryOrderReq");
        UigXmlPost post = new UigXmlPost();
        HttpClient httpclient = new HttpClient();
        HttpClientChacterUtil.setChacterIsUTF(httpclient);
        String dataSend = RequestUtil.orderSendBefore(paramMap).toString();
        String response = post.post(ZshConfig.INTERFACE_URL, dataSend, "application/x-www-form-urlencoded;text/html;charset=UTF-8", httpclient);
        LogUtil.debug( response);
    }

//    @Test
    public void orderRefundTest() {

    }
//    private final String partnerId = "2088511796473652";
//    private final String partner_key = "x7xg9rq9fwq8h7ao143z6nk059nuuwjg";
//    private final String seller_email = "2969137505@qq.com";

//    private final String partnerId = "2088121364704255";
//    private final String partner_key = "kgusrm855d5v1n2m89ftqj0hfja2t0lo";
//    private final String seller_email = "hopedove@qq.com"
//
//   private final String partnerId = "2088201565141845";
//    private final String partner_key = "ai1ce2jkwkmd3bddy97z0xnz3lxqk731";
//    private final String seller_email = "zhaishenghuo@aliyun.com";

    private final String partnerId = "2088311600025415";
    private final String partner_key = "fm2xzsksuc6782fkmy7v7ycto1bzqmwr";
    private final String seller_email = "yxhd227@sina.com";


//    private final String partnerId = "2088201565141845";
//    private final String partner_key = "ai1ce2jkwkmd3bddy97z0xnz3lxqk731";
//    private final String seller_email = "alipay-test20@alipay.com";

//String partner_key = "g7ylzqv5hd4dbt4c737cj6xh5rrkqp97";
//    String partnerId = "2088211560433214";
//    String seller_email = "zhaishenghuo.hr@aliyun.com";
    @Test
    public void sendTaoBao() throws UnsupportedEncodingException {
        //宅生活给您的KEY
        //String key = "791792BE55585F169961AFB9F1300F354AB66310DA079E42E3261158734E4294219B6A097BBCA1E577CB988896258142ADB2602AB17D4A7D";
        String key = "791792BE55585F169961AFB9F1300F354AB66310DA079E42E3261158734E4294219B6A097BBCA1E577CB988896258142ADB2602AB17D4A7D";
        //支付宝提供您的企业合作KEY
        //String partner_key = "ai1ce2jkwkmd3bddy97z0xnz3lxqk731";
//        String partner_key = "g7ylzqv5hd4dbt4c737cj6xh5rrkqp97";
        //支付宝提供您的合作者ID
        //String partnerId = "2088201565141845";
//        String partnerId = "2088211560433214";
        //卖家帐号
        //String seller_email = "alipay-test20@alipay.com";
//        String seller_email = "zhaishenghuo.hr@aliyun.com";
//        String dynamic_id = "0baf3805d5e0d174"; //a13734956c7ff649 c0408ad4b9bea03e
        String dynamic_id = "288884473936796286"; //a13734956c7ff649 c0408ad4b9bea03e
        //----------------------------封装开始
        //----------------------------封装开始
        Map data = new HashMap();
        data.put("service", "alipay.acquire.createandpay");
        data.put("partner", partnerId);
        data.put("_input_charset", "GBK");
        //data.put("notify_url", "http://127.0.0.1:7001/a.action");
//        data.put("alipay_ca_request", "2");
        data.put("out_trade_no", "3652151512289670031");
        data.put("subject", "支付订单标题");
//        data.put("product_code", "SOUNDWAVE_PAY_OFFLINE");
        data.put("product_code", "BARCODE_PAY_OFFLINE");
        data.put("total_fee", "0.01");
        data.put("seller_email", seller_email);
        data.put("price", "0.01");
        data.put("quantity", "1");
        data.put("dynamicId_type", "barcode");
        data.put("dynamic_id", dynamic_id); // a13734956c7ff649 c0408ad4b9bea03e
        //----------------------------封装结束
        //----------------------------排序开始
        String dataSend = RequestUtil.orderSendBefore(data).toString();
        System.out.println("串排序后:"+dataSend);
        //----------------------------排序结束
        //----------------------------加密开始
        String mysign = new MD5().encode(dataSend + partner_key, "GBK");
        System.out.println("加密后:"+mysign);
        //----------------------------加密结束
        //----------------------------处理中文开始
        data.put("subject", URLEncoder.encode("支付订单标题", ZshConfig.GBK));
        //data.put("notify_url", StringEncoding.encode("http://127.0.0.1:7001/a.action",ZshConfig.GBK));
        data.put("sign_type", "MD5");
        data.put("sign", mysign);

        //----------------------------重新排序并生成&=字符串开始
        dataSend = RequestUtil.orderSendBefore(data).toString();
        System.out.println("准备发送的数据为:https://mapi.alipay.com/gateway.do?"+dataSend);
        //----------------------------重新排序并生成&=字符串结束





        //----------------------------发送到支付宝开始
        UigXmlPost post = new UigXmlPost();
        HttpClient httpclient = new HttpClient();
        HttpClientChacterUtil.setChacterIsGbk(httpclient);
        String response = post.post("https://mapi.alipay.com/gateway.do", dataSend,"application/x-www-form-urlencoded;text/html;charset=GBK",httpclient);
        //----------------------------发送到支付宝结束

    }
}
