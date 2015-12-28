package com.victor.mapper;

import com.victor.pojo.AlipayOrderEntity;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 2015/12/19.
 */
@Repository("alipayOrderInfoMapper")
public interface AlipayOrderInfoMapper {

    int insertAlipayOrderInfo(AlipayOrderEntity entity);

    int updateAlipayOrderInfo(AlipayOrderEntity entity);

    List<AlipayOrderEntity> queryAlipayOrderInfo(AlipayOrderEntity entity);

    List<AlipayOrderEntity> queryOrder(Map<String, Object> paramMap);

    int queryOrderNum(Map<String, Object> paramMap);

    Double queryOrderMoney(Map<String, Object> paramMap);
}
