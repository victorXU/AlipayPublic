package com.victor.factory;

import com.alipay.api.AlipayClient;
import com.alipay.api.DefaultAlipayClient;
import com.victor.pojo.AlipayOrderEntity;
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
    public static AlipayClient getAlipayClient(AlipayOrderEntity entity){

        if(null == alipayClient){
            alipayClient = new DefaultAlipayClient(AlipayServiceEnvConstants.ALIPAY_GATEWAY, entity.getAppid(),
                    entity.getPrivate_key(), "json", AlipayServiceEnvConstants.CHARSET);
        }
        return alipayClient;
    }
}
