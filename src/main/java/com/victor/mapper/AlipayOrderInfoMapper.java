package com.victor.mapper;

import com.victor.pojo.AlipayOrderEntity;

import java.util.List;

/**
 * Created by Administrator on 2015/12/19.
 */
public interface AlipayOrderInfoMapper {

    int insertAlipayOrderInfo(AlipayOrderEntity entity);

    int updateAlipayOrderInfo(AlipayOrderEntity entity);

    List<AlipayOrderEntity> queryAlipayOrderInfo(AlipayOrderEntity entity);
}
