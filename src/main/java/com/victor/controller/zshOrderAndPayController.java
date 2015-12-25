package com.victor.controller;

import com.sun.javafx.sg.PGShape;
import com.victor.pojo.Page;
import com.victor.service.OrderAndQueryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
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

    @RequestMapping(value = "/initPay")
    public String initPay(HttpServletRequest request,Model model){
        String total_fee = request.getParameter("total_fee");
        model.addAttribute("total_fee",total_fee);
        return "alipayOrderPay";
    }

    @RequestMapping(value = "/initAlipayConfig")
    public String initAlipayConfig(HttpServletRequest request,Model model){
        return "alipayConfig";
    }

    @RequestMapping(value = "/initQueryOrder")
    public String initQueryOrder(HttpServletRequest request,Model model){
        return "payOrder";
    }
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
        final String out_trade_no = request.getParameter("out_trade_no");
        return orderAndQueryService.alipayQuery(out_trade_no);
    }
    @RequestMapping(value = "/orderQuery", method = RequestMethod.POST, produces = "application/json")
    @ResponseBody
    public Object orderQuery(final HttpServletRequest request){

        return orderAndQueryService.queryOrder(new HashMap<String, String>(){{
           int page = request.getAttribute("page")==null?1:Integer.parseInt(request.getAttribute("page").toString()) ;
           int pageSize = request.getAttribute("pageSize")==null?10:Integer.parseInt(request.getAttribute("pageSize").toString()) ;
            Page myMage = new Page();
            myMage.setPage(page);
            myMage.setPageSize(pageSize);
            put("out_trade_no", request.getParameter("out_trade_no"));
            put("trade_no",request.getParameter("trade_no"));
            put("casher",request.getParameter("casher"));
            put("store",request.getParameter("store"));
            put("begin_time",request.getParameter("begin_time"));
            put("end_time",request.getParameter("end_time"));
            put("offset",myMage.getOffset()+"");
            put("limit",myMage.getLimit()+"");
        }});
    }
}
