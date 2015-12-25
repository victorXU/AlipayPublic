package com.victor.service;

import com.victor.pojo.AlipayOrderEntity;

import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * Description:
 * Author: xuweidong
 * Date: 2015-12-24
 * Time: 20:15
 */
public interface OrderAndQueryService {
    String orderPay(String total_fee, String dynamic_id);

    String alipayQuery(String out_trade_no);

    String refundService(Map<String, String> paramMap);

    Map<String,Object> queryOrder(Map<String,String> ParamMap);
}
