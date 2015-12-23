package com.victor.mapper;

import com.victor.pojo.AlipayOrderEntity;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by Administrator on 2015/12/19.
 */
@Repository("alipayOrderInfoMapper")
public interface AlipayOrderInfoMapper {

    int insertAlipayOrderInfo(AlipayOrderEntity entity);

    int updateAlipayOrderInfo(AlipayOrderEntity entity);

    List<AlipayOrderEntity> queryAlipayOrderInfo(AlipayOrderEntity entity);
}
