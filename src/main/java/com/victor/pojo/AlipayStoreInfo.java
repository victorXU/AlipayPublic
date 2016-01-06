package com.victor.pojo;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Created by Administrator on 2015/12/21.
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class AlipayStoreInfo extends Entity {

    private static final long serialVersionUID = 1L;
    private String rel_state;
    private String remark;
    private String partner_key;
    private String partnerid;
    private String seller_email;
    private String id;
    private String brandid;
    private String ouid;
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
    private String storecode;
    private String orgcode;
    private String actversion;
    private String act_name;
    private String agentid;
    private String private_key;
    private String appid;
}
