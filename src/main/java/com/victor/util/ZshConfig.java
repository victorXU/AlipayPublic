/**
 *
 */
package com.victor.util;


/**
 * 
 * 
 * @author      : 林健
 * @createTime  : 2012-5-9
 * @version     : 1.0 
 * @comments    : 公共配置文件
 * @params	    :
 * @return	    :
 * @requestNum  : 
 * @documentPath:
 */
public class ZshConfig {

	public static final String SYSTEM_OK="1";
	public static final String SYSTEM_FAIL="0";

	//是否是生产，是：pro,否：test
	public final static String env="pro";
	
	public static boolean NOTIFY_DEBUG = false; // true：支付宝支付后不回调，测试用，False:关闭调试，需要回调。
	 
	//文件标识符
	public static String oper = System.getProperty("file.separator");
    //定时刷新维护时间配置
    public static long time_config = env.equals("test")? 1000 * 60 *60 : 1000 * 60 * 5;
    //报文发送编码
    public static String UTF_8 = "UTF-8";
    
    //报文发送编码
    public static String GBK = "GBK";
    
   
    
    //宅生活回调地址：
    public static String CREATE_AND_PAY_NOTIFY_URL = 
    	"test".equals(env)
    		?
    	"http://127.0.0.1:7001/CreateAndPayNotify.uig"
    		:
    	"http://121.199.37.221:4704/CreateAndPayNotify.uig";
    
    


}
