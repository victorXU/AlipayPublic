package com.victor.controller;

import com.victor.service.OrderAndQueryService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;

/**
 * Created with IntelliJ IDEA.
 * Description:
 * Author: xuweidong
 * Date: 2015-12-24
 * Time: 20:21
 */
@Controller
@RequestMapping("/orderAndPay")
public class zshOrderAndPayController{
    @Resource
    OrderAndQueryService orderAndQueryService;

    @RequestMapping(value = "/alipayOrderPay", method = RequestMethod.POST, produces = "application/json")
    @ResponseBody
    public String alipayOrderPay(HttpServletRequest request){
        String total_fee = request.getParameter("total_fee");
        String dynamic_id = request.getParameter("dynamicId");
        return orderAndQueryService.orderPay(total_fee,dynamic_id);
    }
    @RequestMapping(value = "/alipayOrderQuery", method = RequestMethod.POST, produces = "application/json")
    @ResponseBody
    public String alipayOrderQuery(HttpServletRequest request){
        final String trade_no = request.getParameter("trade_no");
        return orderAndQueryService.alipayQuery(new HashMap<String, String>() {{
            put("trade_no", trade_no);
        }});
    }
    @RequestMapping(value = "/orderQuery", method = RequestMethod.POST, produces = "application/json")
    @ResponseBody
    public String orderQuery(HttpServletRequest request){
        final String trade_no = request.getParameter("trade_no");
        return orderAndQueryService.alipayQuery(new HashMap<String, String>(){{
            put("trade_no",trade_no);
        }});
    }
}
