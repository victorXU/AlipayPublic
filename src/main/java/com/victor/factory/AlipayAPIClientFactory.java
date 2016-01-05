package com.victor.factory;

import com.alipay.api.AlipayClient;
import com.alipay.api.DefaultAlipayClient;
import com.victor.util.AlipayServiceEnvConstants;

/**
 * Created with IntelliJ IDEA.
 * Description:
 * Author: xuweidong
 * Date: 2016-1-4
 * Time: 10:40
 */
public class AlipayAPIClientFactory {
    /** API调用客户端 */
    private static AlipayClient alipayClient;

    /**
     * 获得API调用客户端
     *
     * @return
     */
    public static AlipayClient getAlipayClient(){

        if(null == alipayClient){
            alipayClient = new DefaultAlipayClient(AlipayServiceEnvConstants.ALIPAY_GATEWAY, AlipayServiceEnvConstants.APP_ID,
                    AlipayServiceEnvConstants.PRIVATE_KEY, "json", AlipayServiceEnvConstants.CHARSET,AlipayServiceEnvConstants.ALIPAY_PUBLIC_KEY);
        }
        return alipayClient;
    }
}
