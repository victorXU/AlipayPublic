<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
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
            <!--  <div class="sidebar-collapse" id="sidebar-collapse"> <i class="collapse-icon fa fa-bars"></i> </div>-->
            <!--  <ul class='sidebar_menuList'>
                <li id="OC" class='transition_01'>运营中心</li>
                <li id="MC" class='transition_01'>管理中心</li>
                <li id="DC" class='transition_01'>数据中心</li>
                <li id="PM" class='transition_01'>平台管理</li>
            </ul>-->
            <!-- 头部导航栏的右边浮动的系列按钮部分 (该部分可以根据屏幕的宽度自适应样式，届时参考相关设计，内部内容可以自由发挥) -->
            <div class="navbar-header pull-right">
                <!-- todo -->
                <!-- 右边浮动部分的内层(该层的主要作用是通过toggleClass setting-open 来实现内部所有dom元素的样式重写，很牛逼，看情况是否要使用该功能) -->
            </div>
        </div>
    </div>
</div>
<!-- /navbar container -->
