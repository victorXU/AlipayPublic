package com.victor.pojo;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Created by Administrator on 2015/12/19.
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class AlipayOrderEntity extends AlipayBaseEntity {

    /**
     *
     */
    private static final long serialVersionUID = 1L;
    private String partner;
    private String notify_url;
    private String out_trade_no;
    private String subject;
    private String product_code;
    private String total_fee;
    private String seller_id;
    private String seller_email;
    private String buyer_id;
    private String buyer_email;
    private String operator_code;
    private String operator_id;
    private String body;
    private String show_url;
    private String currency;
    private String price;
    private String quantity;
    private String goods_detail;
    private String extend_params;
    private String it_b_pay;
    private String royalty_type;
    private String royalty_parameters;
    private String channel_parameters;
    private String dynamicid_type;
    private String dynamic_id;
    private String remark;
    private String error;
    private String detail_error_code;
    private String detail_error_des;
    private String result_code;
    private String trade_no;
    private String trade_status;
    private String refund_code;
    private String refund_time;
    private String cancel_code;
    private String cancel_time;
    private String machine_code;
    private String cashier;
    private String refund_fee;
    private String disabled;
    private String createuserid;
    private String createusername;
    private String createusercode;
    private String createdatetime;
    private String createip;
    private String updateuserid;
    private String updateusername;
    private String updateusercode;
    private String updatedatetime;
    private String updateip;
    private String id;
    private String brandid;
    private String ouid;
    private String storecode;
    private String orgcode;

    private String validateResult;
}
