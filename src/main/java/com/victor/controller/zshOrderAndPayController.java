package com.victor.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.victor.pojo.Page;
import com.victor.service.OrderAndQueryService;

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

    @RequestMapping(value = "/initQueryOrder", produces = "text/html;charset=utf-8")
    public String initQueryOrder(final HttpServletRequest request,Model model){
        final String out_trade_no = request.getParameter("out_trade_no");
        final String trade_no = request.getParameter("trade_no");
        final String casher = request.getParameter("casher");
        final String store = request.getParameter("store");
        final String begin_time = request.getParameter("begin_time");
        final String end_time = request.getParameter("end_time");
        int page = request.getAttribute("page")==null?1:Integer.parseInt(request.getAttribute("page").toString()) ;
        int pageSize = request.getAttribute("pageSize")==null?10:Integer.parseInt(request.getAttribute("pageSize").toString()) ;
       final Page myMage = new Page();
        myMage.setPage(page);
        myMage.setPageSize(pageSize);
        Map<String,Object> paramMap = orderAndQueryService.queryOrder(new HashMap<String, Object>(){{
            put("out_trade_no", out_trade_no);
            put("trade_no",trade_no);
            put("casher",casher);
            put("store",store);
            put("begin_time",begin_time);
            put("end_time",end_time);
            put("offset",myMage.getOffset());
            put("limit",myMage.getLimit());
        }});
        myMage.setTotal(Integer.parseInt(paramMap.get("totalNum")==null?"0":paramMap.get("totalNum")+""));
        model.addAttribute("out_trade_no", out_trade_no);
        model.addAttribute("trade_no",trade_no);
        model.addAttribute("casher",casher);
        model.addAttribute("store",store);
        model.addAttribute("begin_time",begin_time);
        model.addAttribute("end_time",end_time);
        model.addAttribute("totalPages",myMage.getPageCount());
        model.addAttribute("currentPage",1);
        model.addAttribute("totalNum",paramMap.get("totalNum"));
        model.addAttribute("totalFee",paramMap.get("totalFee"));
        model.addAttribute("alipayOrderEntities",paramMap.get("alipayOrderEntities"));
        return "payOrder";
    }
    @RequestMapping(value = "/alipayOrderPay", method = RequestMethod.POST, produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String alipayOrderPay(HttpServletRequest request){
        String total_fee = request.getParameter("total_fee");
        String dynamic_id = request.getParameter("dynamic_id");
        return orderAndQueryService.orderPay(total_fee,dynamic_id);
    }
    @RequestMapping(value = "/alipayOrderQuery", method = RequestMethod.POST, produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String alipayOrderQuery(HttpServletRequest request){
        final String out_trade_no = request.getParameter("out_trade_no");
        return orderAndQueryService.alipayQuery(out_trade_no);
    }
    @RequestMapping(value = "/orderQuery",produces = "text/html;charset=utf-8")
    public String orderQuery(final HttpServletRequest request,Model model){
        final String out_trade_no = request.getParameter("out_trade_no");
        final String trade_no = request.getParameter("trade_no");
        final String casher = request.getParameter("casher");
        final String store = request.getParameter("store");
        final String begin_time = request.getParameter("begin_time");
        final String end_time = request.getParameter("end_time");
        String pageStr =  request.getParameter("page");
        int page = pageStr==null?1:Integer.parseInt(pageStr.toString()) ;
        final Page myMage = new Page();
        myMage.setPage(page);
        myMage.setPageSize(10);
        Map<String,Object> paramMap = orderAndQueryService.queryOrder(new HashMap<String, Object>(){{
            put("out_trade_no", out_trade_no);
            put("trade_no",trade_no);
            put("casher",casher);
            put("store",store);
            put("begin_time",begin_time);
            put("end_time",end_time);
            put("offset",myMage.getOffset());
            put("limit",myMage.getLimit());
        }});
        myMage.setTotal(Integer.parseInt(paramMap.get("totalNum")==null?"0":paramMap.get("totalNum")+""));
        model.addAttribute("out_trade_no", out_trade_no);
        model.addAttribute("trade_no",trade_no);
        model.addAttribute("casher",casher);
        model.addAttribute("store",store);
        model.addAttribute("begin_time",begin_time);
        model.addAttribute("end_time",end_time);
        model.addAttribute("totalPages",myMage.getPageCount());
        model.addAttribute("currentPage",page);
        model.addAttribute("totalNum",paramMap.get("totalNum"));
        model.addAttribute("totalFee",paramMap.get("totalFee"));
        model.addAttribute("alipayOrderEntities",paramMap.get("alipayOrderEntities"));
        return "payOrder";
    }

    @RequestMapping(value = "/alipayRefund", method = RequestMethod.POST, produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String alipayRefund(HttpServletRequest request){
        final String out_trade_no = request.getParameter("out_trade_no");
        final String totalmoeny = request.getParameter("total_fee");
        return orderAndQueryService.refundService(out_trade_no, totalmoeny);
    }
}
