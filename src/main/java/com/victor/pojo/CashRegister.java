package com.victor.pojo;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * @author Administrator
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class CashRegister implements Serializable {

    private static final long serialVersionUID = 1L;
    private String brandid;
    private String ouid;
    private String storecode;
    private String orgcode;
    private String dynamic_id;
    private String total_fee;

}
