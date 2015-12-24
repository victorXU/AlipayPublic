package com.victor.service;


import com.victor.pojo.AlipayOrderEntity;
import com.victor.pojo.ResponseEntity;
import org.apache.log4j.Logger;

public interface AliPayService {

    public Logger logger = Logger.getLogger("WEB-APP");

    /**
     * 支付宝查询接口
     *
     * @param dt
     * @return
     */
    public ResponseEntity alipayQuery(AlipayOrderEntity dt);

    /**
     * 支付宝预支付
     *
     * @param dt
     * @return
     */
    public ResponseEntity aliPayPrePay(AlipayOrderEntity dt);

    /**
     * 支付宝退款
     *
     * @param dt
     * @return
     */
    public ResponseEntity alipayRefund(AlipayOrderEntity dt);

}
