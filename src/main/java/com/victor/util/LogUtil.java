/**
 * Alipay.com Inc.
 * Copyright (c) 2004-2014 All Rights Reserved.
 */
package com.victor.util;

import org.apache.log4j.Logger;


/**
 * 日志打印工具
 *
 * @author taixu.zqq
 * @version $Id: LogUtil.java, v 0.1 2014年7月25日 下午4:34:46 taixu.zqq Exp $
 */
public class LogUtil {

    public static Logger logger = Logger.getLogger("WEB-APP");

    /**
     * 信息日志打印
     *
     * @param prefixName 前缀名称
     * @param msgContent 参数
     */
    public static void log(String prefixName, String msgContent) {
        logger.debug(prefixName + " : " + msgContent);
    }

    public static void debug(String msg) {
        logger.debug(msg);
    }
}
