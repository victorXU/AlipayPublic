package com.victor.service.impl;

import com.victor.service.OrderAndQueryService;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Created by Administrator on 2015/12/24.
 */
@Service("orderAndQueryService")
public class OrderAndQueryServiceImpl implements OrderAndQueryService {
    public String orderPay(String total_fee, String dynamic_id) {
        return null;
    }

    public String alipayQuery(Map<String, String> paramMap) {
        return null;
    }

    public String refundService(Map<String, String> paramMap) {
        return null;
    }
}
