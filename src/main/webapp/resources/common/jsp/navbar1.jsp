<%@page import="com.crop.web.util.UserUtils"%>
<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" isELIgnored="false"%>
<!-- Loading Container -->
<div class="loading-container">
    <div class="loading-progress">
        <div class="rotator">
            <div class="rotator">
                <div class="rotator colored">
                    <div class="rotator">
                        <div class="rotator colored">
                            <div class="rotator colored"></div>
                            <div class="rotator"></div>
                        </div>
                        <div class="rotator colored"></div>
                    </div>
                    <div class="rotator"></div>
                </div>
                <div class="rotator"></div>
            </div>
            <div class="rotator"></div>
        </div>
        <div class="rotator"></div>
    </div>
</div>
<!--  /Loading Container -->
<!-- ==============================================================华丽丽的分割线============================================================== -->
<!-- navbar container -->
<div class="navbar">
    <!-- 头部导航栏inner部分，直白点就是背景层 -->
    <div class="navbar-inner">
        <!-- 头部导航栏的实体内容部分，说白了就是设定好了padding后的盒子 -->
        <div class="navbar-container">
            <!-- =============头部导航栏的镶边logo部分 (因为是table布局，故内部内容能把该层撑开，内部内容可以自由发挥)============= -->
            <div class="navbar-header pull-left">
                <!-- ===========todo========= -->
                <a href="#" class="navbar-brand"> <small> <img src="${ctx}/resources/common/img/bala_logo.png" alt="" /></small> </a>
                <!-- /===========todo========= -->
            </div>
            <!-- =============侧边栏菜单控制按钮 (这里开始的初始布局是left:189px写死的，如果有需要，请css覆盖之)============= -->
            <div class="sidebar-collapse" id="sidebar-collapse"> <i class="collapse-icon fa fa-bars"></i> </div>
            <ul class='sidebar_menuList'>
                	<li id="O" class='transition_01'  onclick='window.location.href="<%= BaseConstant.UMC_WEB_URL %>/home/O"'>运营中心</li>
                	<li id="M" class='transition_01'  onclick='window.location.href="<%= BaseConstant.UMC_WEB_URL %>/home/M"'>管理中心</li>
                	<li id="DC" class='transition_01'  onclick='window.location.href="<%= BaseConstant.UMC_WEB_URL %>/home/DC"'>数据中心</li>
                	<li id="P" class='transition_01' onclick='window.location.href="<%= BaseConstant.UMC_WEB_URL %>/home/P"'>平台管理</li>
            </ul>
            <!-- 头部导航栏的右边浮动的系列按钮部分 (该部分可以根据屏幕的宽度自适应样式，届时参考相关设计，内部内容可以自由发挥) -->
            <div class="navbar-header pull-right">
                <!-- todo -->
                <!-- 右边浮动部分的内层(该层的主要作用是通过toggleClass setting-open 来实现内部所有dom元素的样式重写，很牛逼，看情况是否要使用该功能) -->
                <div class="navbar-account">
                    <ul class="account-area">
                        <!-- <li> <a class=" dropdown-toggle" data-toggle="dropdown" title="Help" href="#"> <i class="icon fa fa-warning"></i> </a> -->
                            <!--Notification Dropdown-->
                           <!--  <ul class="pull-right dropdown-menu dropdown-arrow dropdown-notifications">
                                <li> <a href="#">
                                    <div class="clearfix">
                                        <div class="notification-icon"> <i class="fa fa-phone bg-themeprimary white"></i> </div>
                                        <div class="notification-body"> <span class="title">Skype meeting with Patty</span> <span class="description">01:00 pm</span> </div>
                                        <div class="notification-extra"> <i class="fa fa-clock-o themeprimary"></i> <span class="description">office</span> </div>
                                    </div>
                                    </a> </li>
                                <li> <a href="#">
                                    <div class="clearfix">
                                        <div class="notification-icon"> <i class="fa fa-check bg-darkorange white"></i> </div>
                                        <div class="notification-body"> <span class="title">Uncharted break</span> <span class="description">03:30 pm - 05:15 pm</span> </div>
                                        <div class="notification-extra"> <i class="fa fa-clock-o darkorange"></i> </div>
                                    </div>
                                    </a> </li>
                                <li> <a href="#">
                                    <div class="clearfix">
                                        <div class="notification-icon"> <i class="fa fa-gift bg-warning white"></i> </div>
                                        <div class="notification-body"> <span class="title">Kate birthday party</span> <span class="description">08:30 pm</span> </div>
                                        <div class="notification-extra"> <i class="fa fa-calendar warning"></i> <i class="fa fa-clock-o warning"></i> <span class="description">at home</span> </div>
                                    </div>
                                    </a> </li>
                                <li> <a href="#">
                                    <div class="clearfix">
                                        <div class="notification-icon"> <i class="fa fa-glass bg-success white"></i> </div>
                                        <div class="notification-body"> <span class="title">Dinner with friends</span> <span class="description">10:30 pm</span> </div>
                                    </div>
                                    </a> </li>
                                <li class="dropdown-footer "> <span> Today, March 28 </span> <span class="pull-right"> 10°c <i class="wi wi-cloudy"></i> </span> </li>
                            </ul>
                            /Notification Dropdown
                        </li>
                        --> <%-- <li> <a class="wave in dropdown-toggle" data-toggle="dropdown" title="Help" href="#"> <i class="icon fa fa-envelope"></i> <span class="badge">3</span> </a>
                            <!--Messages Dropdown-->
                            <ul class="pull-right dropdown-menu dropdown-arrow dropdown-messages">
                                <li> <a href="#"> <img src="${ctx}/resources/common/img/avatars/divyia.jpg" class="message-avatar" alt="Divyia Austin">
                                    <div class="message"> <span class="message-sender"> Divyia Austin </span> <span class="message-time"> 2 minutes ago </span> <span class="message-subject"> Here's the recipe for apple pie </span> <span class="message-body"> to identify the sending application when the senders image is shown for the main icon </span> </div>
                                    </a> </li>
                                <li> <a href="#"> <img src="${ctx}/resources/common/img/avatars/bing.png" class="message-avatar" alt="Microsoft Bing">
                                    <div class="message"> <span class="message-sender"> Bing.com </span> <span class="message-time"> Yesterday </span> <span class="message-subject"> Bing Newsletter: The January Issue‏ </span> <span class="message-body"> Discover new music just in time for the Grammy® Awards. </span> </div>
                                    </a> </li>
                                <li> <a href="#"> <img src="${ctx}/resources/common/img/avatars/adam-jansen.jpg" class="message-avatar" alt="Divyia Austin">
                                    <div class="message"> <span class="message-sender"> Nicolas </span> <span class="message-time"> Friday, September 22 </span> <span class="message-subject"> New 4K Cameras </span> <span class="message-body"> The 4K revolution has come over the horizon and is reaching the general populous </span> </div>
                                    </a> </li>
                            </ul>
                            <!--/Messages Dropdown-->
                        </li> --%>
                       <!--  <li> <a class="dropdown-toggle" data-toggle="dropdown" title="Tasks" href="#"> <i class="icon fa fa-tasks"></i> <span class="badge">4</span> </a>
                            Tasks Dropdown
                            <ul class="pull-right dropdown-menu dropdown-tasks dropdown-arrow ">
                                <li class="dropdown-header bordered-darkorange"> <i class="fa fa-tasks"></i> 4 Tasks In Progress </li>
                                <li> <a href="#">
                                    <div class="clearfix"> <span class="pull-left">Account Creation</span> <span class="pull-right">65%</span> </div>
                                    <div class="progress progress-xs">
                                        <div style="width:65%" class="progress-bar"></div>
                                    </div>
                                    </a> </li>
                                <li> <a href="#">
                                    <div class="clearfix"> <span class="pull-left">Profile Data</span> <span class="pull-right">35%</span> </div>
                                    <div class="progress progress-xs">
                                        <div style="width:35%" class="progress-bar progress-bar-success"></div>
                                    </div>
                                    </a> </li>
                                <li> <a href="#">
                                    <div class="clearfix"> <span class="pull-left">Updating Resume</span> <span class="pull-right">75%</span> </div>
                                    <div class="progress progress-xs">
                                        <div style="width:75%" class="progress-bar progress-bar-darkorange"></div>
                                    </div>
                                    </a> </li>
                                <li> <a href="#">
                                    <div class="clearfix"> <span class="pull-left">Adding Contacts</span> <span class="pull-right">10%</span> </div>
                                    <div class="progress progress-xs">
                                        <div style="width:10%" class="progress-bar progress-bar-warning"></div>
                                    </div>
                                    </a> </li>
                                <li class="dropdown-footer"> <a href="#"> See All Tasks </a>
                                    <button class="btn btn-xs btn-default shiny darkorange icon-only pull-right"><i class="fa fa-check"></i></button>
                                </li>
                            </ul>
                            /Tasks Dropdown
                        </li> -->
                        <li> <a class="login-area dropdown-toggle" data-toggle="dropdown">
                            <section>
                                   <%-- <h2><span class="profile"><span><%=UserUtils.getAccount()%></span></span></h2> --%>
                            </section>
                            </a>
                            <!--Login Area Dropdown-->
                            <ul class="pull-right dropdown-menu dropdown-arrow dropdown-login-area">
                                 <!--Avatar Area-->
                                 <li class="edit">
                                 <a href="<%= BaseConstant.UMC_WEB_URL %>" class="pull-left">我的主页</a>
                                </li>
                                <li class="edit">
                                 <a href="<%= BaseConstant.UMC_WEB_URL %>/profile" class="pull-left">我的账户</a>
                                </li>
                                <li class="edit">
                                <a href="<%= BaseConstant.UMC_WEB_URL %>/changePassword" class="pull-left">修改密码</a>
                                </li>
                                <li class="edit">
                                <a href="<%= BaseConstant.UMC_WEB_URL %>/logout" class="pull-left">退出</a>
                                </li>
                            </ul>
                            <!--/Login Area Dropdown-->
                        </li>
                        <!-- /Account Area -->
                        <!--Note: notice that setting div must start right after account area list.
                            no space must be between these elements-->
                        <!-- Settings -->
                    </ul>
                    <div class="setting"> <a id="btn-setting" title="Setting" href="#"> <i class="icon fa fa-thumb-tack"></i> </a> </div>
                    <div class="setting-container">
                        <label>
                        <input type="checkbox" id="checkbox_fixednavbar">
                        <span class="text">固定头菜单</span> </label>
                        <label>
                        <input type="checkbox" id="checkbox_fixedsidebar">
                        <span class="text">固定左菜单</span> </label>
                        <label>
                        <input type="checkbox" id="checkbox_fixedbreadcrumbs">
                        <span class="text">固定菜单路径</span> </label>
                        <!-- <label>
                        <input type="checkbox" id="checkbox_fixedheader">
                        <span class="text">Fixed Header</span> </label> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- /navbar container -->
