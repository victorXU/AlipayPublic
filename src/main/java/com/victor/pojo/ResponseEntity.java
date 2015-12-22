package com.victor.pojo;

/**
 * Created by Administrator on 2015-11-14.
 */
public class ResponseEntity extends Entity {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String status;
    private String error;
    private String msg;
    private Object bean;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getBean() {
        return bean;
    }

    public void setBean(Object bean) {
        this.bean = bean;
    }

	@Override
	public String toString() {
		return "ResponseEntity [status=" + status + ", error=" + error + ", msg=" + msg + ", bean=" + bean + "]";
	}
    
}
