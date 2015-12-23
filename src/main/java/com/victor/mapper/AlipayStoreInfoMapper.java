package com.victor.mapper;

import com.victor.pojo.AlipayStoreInfo;

import java.util.List;

/**
 * Created by Administrator on 2015/12/21.
 */
public interface AlipayStoreInfoMapper {
    int insertAlipayOrderInfo(AlipayStoreInfo entity);

    int updateAlipayOrderInfo(AlipayStoreInfo entity);

    List<AlipayStoreInfo> queryAlipayOrderInfo(AlipayStoreInfo entity);
}
