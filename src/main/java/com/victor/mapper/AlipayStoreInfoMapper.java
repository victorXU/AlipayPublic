package com.victor.mapper;

import com.victor.pojo.AlipayStoreInfo;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by Administrator on 2015/12/21.
 */
@Repository("alipayStoreInfoMapper")
public interface AlipayStoreInfoMapper {
    int insertAlipayOrderInfo(AlipayStoreInfo entity);

    int updateAlipayOrderInfo(AlipayStoreInfo entity);

    List<AlipayStoreInfo> queryAlipayOrderInfo(AlipayStoreInfo entity);
    List<AlipayStoreInfo> queryAlipayPayInfo(AlipayStoreInfo entity);
}
