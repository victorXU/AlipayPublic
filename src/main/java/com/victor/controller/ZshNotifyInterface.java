package com.victor.controller;

import com.victor.service.CreateAndPayService;
import com.victor.util.LogUtil;
import com.victor.util.RequestUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * [一句话功能简述]<p>
 * [功能详细描述]<p>
 *
 * @author victor
 * @version 1.0, 2015-7-22
 * @see
 * @since V1.0
 */
@Controller
@RequestMapping("/notify")
public class ZshNotifyInterface {

    @Resource
    CreateAndPayService createAndPayService;

    @RequestMapping("/alipayNotify")
    public String alipayNotify(HttpServletRequest request) {
        LogUtil.debug("【支付宝回调】alipayNotify begin：request=" + request);
        String response = "";
        try {
            Map<String, Object> requestMap = RequestUtil.getRequestParams(request);
            response = createAndPayService.notifyService(requestMap);
        } catch (Exception e) {
            LogUtil.debug("【支付宝回调】alipayNotify Exception=" + e.getMessage());
            e.printStackTrace();
        }
        LogUtil.debug("【支付宝回调】alipayNotify end：response=" + response);
        return response;
    }

}
