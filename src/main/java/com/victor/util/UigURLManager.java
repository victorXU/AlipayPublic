package com.victor.util;

import org.apache.log4j.Logger;
import szwx855.base.configure.ConfigTools;
import szwx855.base.exception.AppException;
import szwx855.base.utils.SystemTools;
import szwx855.base.xml.BaseUigURLManager;

public class UigURLManager extends BaseUigURLManager {
	public static Logger logger = SystemTools.getLoggerForWebApp();

	public void getBsspUrl(String operSource, String cityID) {
		try {
			if (("".equals(operSource.trim())) || ("".equals(cityID.trim()))) {
				logger.error("BaseBsspUrl.getBsspUrl(String,String)->Exception::输入参数不能为空");
				throw new AppException(
						"BaseBsspUrl.getBsspUrl(String,String)->Exception::输入参数不能为空");
			}

			setUrl((String) getConfigTools().getProperty(operSource, cityID));
		} catch (AppException e) {
			e.printStackTrace();
		}
	}
}
