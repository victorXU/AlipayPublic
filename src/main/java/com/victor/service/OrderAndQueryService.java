package com.victor.service;

import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * Description:
 * Author: xuweidong
 * Date: 2015-12-24
 * Time: 20:15
 */
public interface OrderAndQueryService {
    public String orderPay(String total_fee, String dynamic_id);

    public String alipayQuery(Map<String, String> paramMap);

    public String refundService(Map<String, String> paramMap);
}
