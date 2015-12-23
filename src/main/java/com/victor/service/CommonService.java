package com.victor.service;

import com.victor.pojo.AlipayOrderEntity;
import com.victor.util.UigXmlMgr;

import java.util.Map;

/**
 * Created by Administrator on 2015/12/20.
 */
public interface CommonService {

    public boolean validateRequest(Map<String, String> requestMap, AlipayOrderEntity entity);

    public UigXmlMgr returnResponseXml(UigXmlMgr headXml, UigXmlMgr zshResponse, AlipayOrderEntity entity);
}
