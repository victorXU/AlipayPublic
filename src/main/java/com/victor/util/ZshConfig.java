/**
 *
 */
package com.victor.util;


/**
 * 
 * 
 * @author      : �ֽ�
 * @createTime  : 2012-5-9
 * @version     : 1.0 
 * @comments    : ���������ļ�
 * @params	    :
 * @return	    :
 * @requestNum  : 
 * @documentPath:
 */
public class ZshConfig {

	public static final String SYSTEM_OK="1";
	public static final String SYSTEM_FAIL="0";

	//�Ƿ����������ǣ�pro,��test
	public final static String env="pro";
	
	public static boolean NOTIFY_DEBUG = false; // true��֧����֧���󲻻ص��������ã�False:�رյ��ԣ���Ҫ�ص���
	 
	//�ļ���ʶ��
	public static String oper = System.getProperty("file.separator");
    //��ʱˢ��ά��ʱ������
    public static long time_config = env.equals("test")? 1000 * 60 *60 : 1000 * 60 * 5;
    //���ķ��ͱ���
    public static String UTF_8 = "UTF-8";
    
    //���ķ��ͱ���
    public static String GBK = "GBK";
    
   
    
    //լ����ص���ַ��
    public static String CREATE_AND_PAY_NOTIFY_URL = 
    	"test".equals(env)
    		?
    	"http://127.0.0.1:7001/CreateAndPayNotify.uig"
    		:
    	"http://121.199.37.221:4704/CreateAndPayNotify.uig";
    
    


}
