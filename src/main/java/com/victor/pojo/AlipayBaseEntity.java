package com.victor.pojo;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Created by Administrator on 2015/12/19.
 */
@Data
public class AlipayBaseEntity extends Entity {

    private static final long serialVersionUID = 1L;
    private String partner_key;
    private String version;
    private String instId;
    private String type;
    private String msgId;
    private String msgTime;
    private String private_key;
    private String appid;
}
