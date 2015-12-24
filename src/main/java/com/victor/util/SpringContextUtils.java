package com.victor.util;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * 获取ApplicationContext和Object的工具类<p>
 * [功能详细描述]<p>
 *
 * @author victor
 * @version 1.0, 2015-7-21
 * @see
 * @since V1.0
 */
@Component
public class SpringContextUtils implements ApplicationContextAware {

    private static ApplicationContext applicationContext;

    /**
     * 获取applicationContext对象
     * [功能详细描述]<p>
     *
     * @return
     * @author victor
     * @version 1.0, 2015-7-21
     * @see
     * @since V1.0
     */
    public static ApplicationContext getApplicationContext() {
        return applicationContext;
    }

    /**
     * [一句话功能简述]<p>
     * [功能详细描述]<p>
     *
     * @param arg0
     * @throws BeansException
     * @author victor
     * @version 1.0, 2015-7-21
     * @see
     * @since V1.0
     */
    public void setApplicationContext(ApplicationContext arg0) throws BeansException {
        applicationContext = arg0;
    }

    /**
     * 根据bean的id来查找对象
     * [功能详细描述]<p>
     *
     * @param id
     * @return
     * @author victor
     * @version 1.0, 2015-7-21
     * @see
     * @since V1.0
     */
    public static Object getBeanById(String id) {
        return applicationContext.getBean(id);
    }

    /**
     * 根据bean的class来查找对象
     * [功能详细描述]<p>
     *
     * @param c
     * @return
     * @author victor
     * @version 1.0, 2015-7-21
     * @see
     * @since V1.0
     */
    public static <T> Object getBeanByClass(Class<T> c) {
        return applicationContext.getBean(c);
    }

}
