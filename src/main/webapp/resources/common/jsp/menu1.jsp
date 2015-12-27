<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" isELIgnored="false"%>

<div class="page-sidebar" id="sidebar">
    <!-- 菜单 -->
    <!-- 运营中心 -->
    
    <ul id="O_Menu" class="nav sidebar-menu" style="display:none;">
        <li id="O_SMS"> 
          <a href="#" class="menu-dropdown">
          	<i class="menu-icon glyphicon glyphicon-home"></i> 
            <span class="menu-text">挂机短信</span>
            <!-- 在此处添加一个 '>' 符号 -->
            <i class="menu-expand"></i> 
          </a>
            <!-- 此处为子菜单的列表，这里用class为submenu的ul标签套一层，内部结构还是如外层一样逐层嵌套 -->
            <ul class="submenu">
                	<li id="O_SMS_M010"> <a href="#"> <span class="menu-text">发送者管理</span> </a> </li>
                
                	<li id="O_SMS_M020"> <a href="#"> <span class="menu-text">短信主题管理</span> </a> </li>
                
                	<li id="O_SMS_M030"> <a href="#"> <span class="menu-text">短信内容管理</span> </a> </li>
                
                	<li id="O_SMS_M040"> <a href="#"> <span class="menu-text">挂机短信日志</span> </a> </li>
                
            </ul>
        </li>
        
	        <li id="O_VIP"> 
	          <a href="#" class="menu-dropdown"> 
	          	<i class="menu-icon glyphicon glyphicon-home"></i> 
	            <span class="menu-text"> 门店业务 </span>
	            <!-- 在此处添加一个 '>' 符号 -->
	            <i class="menu-expand"></i> 
	          </a>
	            <!-- 此处为子菜单的列表，这里用class为submenu的ul标签套一层，内部结构还是如外层一样逐层嵌套 -->
	            <ul class="submenu">
		                <li id="O_VIP_ACT">
		                	<a href="#"  class="menu-dropdown">
		                		<span class="menu-text">会员管理</span>
		                		<i class="menu-expand"></i>
		                	</a>
		                	<ul class="submenu">
			                    	<li id="O_VIP_ACT_M010">
			                           	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">会员查询</span>
			                            </a>
			                        </li>
		                        
			                        <li id="O_VIP_ACT_M020">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">会员开户登记</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_ACT_M030">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">会员资料编辑</span>
			                            </a>
			                        </li>
		                        
		                    </ul>
		                </li>
		                <li id="O_VIP_RP">
		                	<a href="#"  class="menu-dropdown">
		                		<span class="menu-text">积分管理</span>
		                		<i class="menu-expand"></i>
		                	</a>
		                	<ul class="submenu">
			                    	<li id="O_VIP_RP_M010">
			                           	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">积分调整单查询</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_RP_M020">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">积分调整</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_RP_M030">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">积分兑换单查询</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_RP_M040">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">门店积分兑换</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_RP_M050">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">积分商品领取</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_RP_M060">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">积分兑换单撤销</span>
			                            </a>
			                        </li>
		                        
		                    </ul>
		                </li>
		                <li id="O_VIP_PI">
		                	<a href="#"  class="menu-dropdown">
		                		<span class="menu-text">积分商品管理</span>
		                		<i class="menu-expand"></i>
		                	</a>
		                	<ul class="submenu">
			                    	<li id="O_VIP_PI_M010">
			                           	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">积分商品查询</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_PI_M020">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">积分商品维护</span>
			                            </a>
			                        </li>
		                        
		                    </ul>
		                </li>
		                <li id="O_VIP_COU">
		                	<a href="#"  class="menu-dropdown">
		                		<span class="menu-text">激励物管理</span>
		                		<i class="menu-expand"></i>
		                	</a>
		                	<ul class="submenu">
			                    	<li id="O_VIP_COU_M010">
			                           	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">电子券查询</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_COU_M020">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">电子券维护</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_COU_M030">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">礼品查询</span>
			                            </a>
			                        </li>
			                        <li id="O_VIP_COU_M040">
			                        	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">礼品维护</span>
			                            </a>
			                        </li>
		                        
		                    </ul>
		                </li>
		                <li id="O_VIP_RPT">
		                	<a href="#"  class="menu-dropdown">
		                		<span class="menu-text">报表</span>
		                		<i class="menu-expand"></i>
		                	</a>
		                	<ul class="submenu">
			                    	<li id="O_VIP_RPT_M010">
			                           	<a href="#">
			                            	<i class="menu-icon"></i>
			                                <span class="menu-text">销售数据查询</span>
			                            </a>
			                        </li>
		                        
		                    </ul>
		                </li>
	                
	            </ul>
	        </li>
        
    </ul>
    
    <!-- 管理中心 -->
	    <ul id="M_Menu" class="nav sidebar-menu" style="display:none;">
		        <li id="M_VIP"> 
		          <a href="#" class="menu-dropdown">
		          	<i class="menu-icon glyphicon glyphicon-home"></i> 
		            <span class="menu-text"> 会员管理 </span>
		            <!-- 在此处添加一个 '>' 符号 -->
		            <i class="menu-expand"></i> 
		          </a>
		            <!-- 此处为子菜单的列表，这里用class为submenu的ul标签套一层，内部结构还是如外层一样逐层嵌套 -->
		            <ul class="submenu">
			                <li id="M_VIP_ACT"> 
			                	<a href="#"  class="menu-dropdown">
									<span class="menu-text">会员账户</span> 
				                	<i class="menu-expand"></i>
			                	</a> 
			                	<ul class="submenu">
				                    	<li id="M_VIP_ACT_M010">
				                           	<a href="<%= BaseConstant.VIP_WEB_URL %>/vip/list">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">会员信息</span>
				                            </a>
				                        </li>
				                        <li id="M_VIP_ACT_M020">
				                        	<a href="<%= BaseConstant.VIP_WEB_URL %>/vipMerge/list">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">会员合并</span>
				                            </a>
				                        </li>
				                        <li id="M_VIP_ACT_M030">
				                        	<a href="#">
				                            	<i class="menu-icon"></i>
				                               	<span class="menu-text">会员转移</span>
				                           </a>
				                        </li>
				                        <li id="M_VIP_ACT_M040">
				                        	<a href="#">
				                            	<i class="menu-icon"></i>
				                               	<span class="menu-text">账户日志</span>
				                           </a>
				                        </li>
			                        
			                    </ul>
			                </li>
			                <li id="M_VIP_RP">
								<a href="#" class="menu-dropdown"> 
									<span class="menu-text">会员积分</span>
									<i class="menu-expand"></i>
								</a>
								<ul class="submenu">
				                    	<li id="M_VIP_RP_M010">
				                           	<a href="<%= BaseConstant.VIP_WEB_URL %>/vipPointRule/list">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">品牌积分规则</span>
				                            </a>
				                        </li>
				                        <li id="M_VIP_RP_M020">
				                        	<a href="<%= BaseConstant.VIP_WEB_URL %>/vipPointRulePersion/list">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">OU积分规则</span>
				                            </a>
				                        </li>
				                        <li id="M_VIP_RP_M030">
				                        	<a href="<%= BaseConstant.VIP_WEB_URL %>/vip/editPoints">
				                            	<i class="menu-icon"></i>
				                               	<span class="menu-text">积分调整</span>
				                           </a>
				                        </li>
			                        
			                    </ul>
							</li>
			                <li id="M_VIP_RANK">
								<a href="#"  class="menu-dropdown">
									<span class="menu-text">会员等级</span>
									<i class="menu-expand"></i>
								</a>
								<ul class="submenu">
				                    	<li id="M_VIP_RANK_M010">
				                           	<a href="<%= BaseConstant.VIP_WEB_URL %>/vipGradeBrand/list">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">品牌会员等级</span>
				                            </a>
				                        </li>
				                        <li id="M_VIP_RANK_M020">
				                        	<a href="<%= BaseConstant.VIP_WEB_URL %>/vipGradeBrand/listPersion">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">OU会员等级</span>
				                            </a>
				                        </li>
				                        <li id="M_VIP_RANK_M030">
				                        	<a href="<%= BaseConstant.VIP_WEB_URL %>/vipLdownGrade/list">
				                            	<i class="menu-icon"></i>
				                               	<span class="menu-text">会员升降级规则</span>
				                           </a>
				                        </li>
			                        
			                    </ul>
							</li>
			                <li id="M_VIP_CARD">
								<a href="#" class="menu-dropdown">
									<span class="menu-text">会员卡设置</span>
									<i class="menu-expand"></i>
								</a>
								<ul class="submenu">
				                    	<li id="M_VIP_CARD_M010">
				                           	<a href="<%= BaseConstant.VIP_WEB_URL %>/vipSet/list">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">会员卡系列</span>
				                            </a>
				                        </li>
				                        <li id="M_VIP_CARD_M020">
				                        	<a href="<%= BaseConstant.VIP_WEB_URL %>/vipGradeLevel/list">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">会员卡等级</span>
				                            </a>
				                        </li>
				                        <li id="M_VIP_CARD_M030">
				                        	<a href="#">
				                            	<i class="menu-icon"></i>
				                               	<span class="menu-text">会员卡号码段</span>
				                           </a>
				                        </li>
			                        
			                    </ul>
							</li>
			                <li id="M_VIP_VIS">
								<a href="#" class="menu-dropdown">
									<span class="menu-text">会员回访</span>
									<i class="menu-expand"></i>
								</a>
								<ul class="submenu">
				                    	<li id="M_VIP_VIS_M010">
				                           	<a href="#">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">会员回访计划</span>
				                            </a>
				                        </li>
				                        <li id="M_VIP_VIS_M020">
				                        	<a href="#">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">会员回访记录</span>
				                            </a>
				                        </li>
			                        
			                    </ul>
							</li>
						
		            </ul>
		        </li>
		        <li id="M_RPM"> 
		          <a href="#" class="menu-dropdown"> 
		          	<i class="menu-icon glyphicon glyphicon-home"></i> 
		            <span class="menu-text">积分商城</span>
		            <!-- 在此处添加一个 '>' 符号 -->
		            <i class="menu-expand"></i> 
		          </a>
		            <!-- 此处为子菜单的列表，这里用class为submenu的ul标签套一层，内部结构还是如外层一样逐层嵌套 -->
		            <ul class="submenu">
		                	<li id="M_RPM_M020"> <a href="<%= BaseConstant.VIP_WEB_URL %>/rpmProduct/list"> <span class="menu-text">积分商品管理</span> </a> </li>
		                
		                	<li id="M_RPM_M030"> <a href="<%= BaseConstant.VIP_WEB_URL %>/rpmOrder/list"> <span class="menu-text">积分兑换单管理</span> </a> </li>
		                
		            </ul>
		        </li>
	        
		        <li id="M_COU"> 
		          <a href="#" class="menu-dropdown"> 
		          	<i class="menu-icon glyphicon glyphicon-home"></i> 
		            <span class="menu-text">激励管理 </span>
		            <!-- 在此处添加一个 '>' 符号 -->
		            <i class="menu-expand"></i> 
		          </a>
		            <!-- 此处为子菜单的列表，这里用class为submenu的ul标签套一层，内部结构还是如外层一样逐层嵌套 -->
		            <ul class="submenu">
		                	<li id="M_COU_M010"> <a href="<%= BaseConstant.VIP_WEB_URL %>/couponEle/list"> <span class="menu-text">电子券管理</span> </a> </li>
		                
		                	<li id="M_COU_M020"> <a href="<%= BaseConstant.VIP_WEB_URL %>/couponReal/list"> <span class="menu-text">礼品管理</span> </a> </li>
		                
		            </ul>
		        </li>
	        
		        <li id="M_ORG"> 
		          <a href="<%= BaseConstant.ORG_WEB_URL %>/list" class="menu-dropdown"> 
		          	<i class="menu-icon glyphicon glyphicon-home"></i> 
		            <span class="menu-text"> 组织管理 </span>
		          </a>
		        </li>
		        <li id="M_UMCB"> 
		          <a href="#" class="menu-dropdown"> 
		          	<i class="menu-icon glyphicon glyphicon-home"></i> 
		            <span class="menu-text">运营体系</span>
		            <!-- 在此处添加一个 '>' 符号 -->
		            <i class="menu-expand"></i> 
		          </a>
		            <!-- 此处为子菜单的列表，这里用class为submenu的ul标签套一层，内部结构还是如外层一样逐层嵌套 -->
		            <ul class="submenu">
			                <li id="M_UMCB_BRA">
			                	<a href="#" class="menu-dropdown">
			                		<span class="menu-text">品牌管理</span>
			                		<i class="menu-expand"></i>
			                	</a>
			                	<ul class="submenu">
				                    	<li id="M_UMCB_BRA_M010">
				                           	<a href="<%= BaseConstant.UMCB_WEB_URL %>/myBrand">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">品牌配置</span>
				                            </a>
				                        </li>
				                        <li id="M_UMCB_BRA_M020">
				                        	<a href="#">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">品牌发布渠道</span>
				                            </a>
				                        </li>
				                        <li id="M_UMCB_BRA_M030">
				                        	<a href="<%= BaseConstant.UMCB_WEB_URL %>/brandNoRule">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">编号规则</span>
				                            </a>
				                        </li>
			                        
			                    </ul>
			                </li>
			                <li id="M_UMCB_OU">
			                	<a href="#" class="menu-dropdown">
			                		<span class="menu-text">OU管理</span>
			                		<i class="menu-expand"></i>
			                	</a>
			                	<ul class="submenu">
				                    	<li id="M_UMCB_OU_M010">
				                           	<a href="<%= BaseConstant.UMCB_WEB_URL %>/ou">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">品牌OU管理</span>
				                            </a>
				                        </li>
			                        
				                        <li id="M_UMCB_OU_M020">
				                        	<a href="<%= BaseConstant.UMCB_WEB_URL %>/myOu">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">OU配置</span>
				                            </a>
				                        </li>
			                        
				                        <li id="M_UMCB_OU_M030">
				                        	<a href="#">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">OU发布渠道</span>
				                            </a>
				                        </li>
			                        
			                    </ul>
			                </li>
		                
			                <li id="M_UMCB_USER">
			                	<a href="#" class="menu-dropdown">
			                		<span class="menu-text">用户管理</span>
			                		<i class="menu-expand"></i>
			                	</a>
			                	<ul class="submenu">
				                    	<li id="M_UMCB_USER_M010">
				                           	<a href="<%= BaseConstant.UMCB_WEB_URL %>/brandUser">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">品牌用户</span>
				                            </a>
				                        </li>
				                        <li id="M_UMCB_USER_M020">
				                        	<a href="<%= BaseConstant.UMCB_WEB_URL %>/ouUser">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">OU用户</span>
				                            </a>
				                        </li>
			                        
			                    </ul>
			                </li>
		                
		            </ul>
		        </li>
		        <li id="M_MSGC"> 
		          <a href="#" class="menu-dropdown"> 
		          	<i class="menu-icon glyphicon glyphicon-home"></i> 
		            <span class="menu-text">消息中心 </span>
		            <!-- 在此处添加一个 '>' 符号 -->
		            <i class="menu-expand"></i> 
		          </a>
		            <!-- 此处为子菜单的列表，这里用class为submenu的ul标签套一层，内部结构还是如外层一样逐层嵌套 -->
		            <ul class="submenu">
		                	<li id="M_MSGC_M010"> <a href="#"> <span class="menu-text">消息日志</span> </a> </li>
		                
		                	<li id="M_MSGC_M020"> <a href="#"> <span class="menu-text">消息模板</span> </a> </li>
		                
		                	<li id="M_MSGC_M030"> <a href="#"> <span class="menu-text">短信账户</span> </a> </li>
		                
		            </ul>
		        </li>
	        
	    </ul>
    
    <!-- 数据中心 -->
    <ul id="D_Menu" class="nav sidebar-menu" style="display:none;">
    </ul>
    <!-- 平台管理 -->
	     <ul id="P_Menu" class="nav sidebar-menu" style="display:none;">
		        <li id="P_UMCP"> 
		          <a href="#" class="menu-dropdown">
		          	<i class="menu-icon glyphicon glyphicon-home"></i> 
		            <span class="menu-text">运营管理</span>
		            <!-- 在此处添加一个 '>' 符号 -->
		            <i class="menu-expand"></i> 
		          </a>
		            <!-- 此处为子菜单的列表，这里用class为submenu的ul标签套一层，内部结构还是如外层一样逐层嵌套 -->
		            <ul class="submenu"> 
		                	<li id="P_UMCP_M010"><a href="<%= BaseConstant.UMC_WEB_URL %>/channelType"><span class="menu-text">渠道类型</span> </a> </li>
		                
		                	<li id="P_UMCP_M020"> <a href="<%= BaseConstant.UMC_WEB_URL %>/app"> <span class="menu-text">应用管理</span> </a> </li>
		                
		               		<li id="P_UMCP_M030"> <a href="<%= BaseConstant.UMC_WEB_URL %>/permission"> <span class="menu-text">权限管理</span> </a> </li>
		                
		                	<li id="P_UMCP_M040"> <a href="<%= BaseConstant.UMC_WEB_URL %>/role"> <span class="menu-text">角色管理</span> </a> </li>
		                
		                	<li id="P_UMCP_M050"> <a href="<%= BaseConstant.UMC_WEB_URL %>/user"> <span class="menu-text">平台用户管理</span> </a> </li>
		                	<li id="P_UMCP_M060"> <a href="<%= BaseConstant.UMC_WEB_URL %>/enterprise"> <span class="menu-text">企业管理</span> </a> </li>
		                
		                	<li id="P_UMCP_M070"> <a href="<%= BaseConstant.UMC_WEB_URL %>/brand"> <span class="menu-text">平台品牌管理</span> </a> </li>
		                
		                	<li id="P_UMCP_SMS">
								<a href="#" class="menu-dropdown">
									<span class="menu-text">短信管理</span>
									<i class="menu-expand"></i>
								</a>
			                	<ul class="submenu">
				                    	<li id="P_UMCP_SMS_M010">
				                           	<a href="#">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">短信网关</span>
				                            </a>
				                        </li>
			                        
				                        <li id="P_UMCP_SMS_M020">
				                        	<a href="#">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">敏感词</span>
				                            </a>
				                        </li>
			                        
				                        <li id="P_UMCP_SMS_M030">
				                        	<a href="#">
				                            	<i class="menu-icon"></i>
				                                <span class="menu-text">充值记录</span>
				                            </a>
				                        </li>
			                        
			                    </ul>
							</li>
		                
		            </ul>
		        </li>
	         
		        <li id="P_UIM"> 
		          <a href="#" class="menu-dropdown"> 
		          	<i class="menu-icon glyphicon glyphicon-home"></i> 
		            <span class="menu-text"> 基础数据 </span>
		            <!-- 在此处添加一个 '>' 符号 -->
		            <i class="menu-expand"></i> 
		          </a>
		            <!-- 此处为子菜单的列表，这里用class为submenu的ul标签套一层，内部结构还是如外层一样逐层嵌套 -->
		            <ul class="submenu">
		                	<li id="P_UIM_M010"> <a href="<%= BaseConstant.UIM_WEB_URL %>/codetype/list"> <span class="menu-text">代码类型</span></a></li>
		                	<li id="P_UIM_M020"> <a href="<%= BaseConstant.UIM_WEB_URL %>/code/list"> <span class="menu-text">代码管理</span> </a> </li>
		                
		            </ul>
		        </li>
	        
	    </ul>
     
</div>
