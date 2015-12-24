import com.victor.util.*;
import org.apache.commons.httpclient.HttpClient;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Map;

/**
 * Created by Administrator on 2015/12/23.
 */
//@RunWith(SpringJUnit4ClassRunner.class)
//@ContextConfiguration(locations = "classpath:spring-config.xml")
public class TestInterface {

    @Test
    public void orderPayTest() {
        Map<String,Object> paramMap = RequestUtil.getParamData();
        paramMap.put("product_code","BARCODE_PAY_OFFLINE");
        paramMap.put("notify_url", ZshConfig.CREATE_AND_PAY_NOTIFY_URL);
        paramMap.put("out_trade_no", "3402304823034812");
        paramMap.put("subject", "լ����ͳһ֧������");
        paramMap.put("total_fee", "0.01");
        paramMap.put("price", "0.01");
        paramMap.put("quantity", "1");
        paramMap.put("dynamic_id", "a13734956c7ff649");
        String dataSend = RequestUtil.orderSendBefore(paramMap).toString();
        LogUtil.debug("��֧����ͳһ֧���ӿڡ��������ݣ�dataSend=" + dataSend);
        // ----------------------------���͵�֧������ʼ----------------------------
        UigXmlPost post = new UigXmlPost();
        HttpClient httpclient = new HttpClient();
        HttpClientChacterUtil.setChacterIsUTF(httpclient);
        String response = post.post(ZshConfig.INTERFACE_URL, dataSend,"application/x-www-form-urlencoded;text/html;charset=UTF-8",httpclient);
        LogUtil.debug("��֧����ͳһ֧���ӿڡ����ؽ����response=" + response);
    }

    @Test
    public void orderQueryTest() {

    }

    @Test
    public void orderRefundTest() {

    }
}
