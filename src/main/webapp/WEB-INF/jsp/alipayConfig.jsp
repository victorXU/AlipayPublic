<%--
  Created by IntelliJ IDEA.
  User: xuweidong
  Date: 2015-12-25
  Time: 16:54
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
  String path = request.getContextPath();
  String basePath = request.getScheme() + "://"
          + request.getServerName() + ":" + request.getServerPort()
          + path + "/";
%>
<!DOCTYPE html>
<!--
BeyondAdmin - Responsive Admin Dashboard Template build with Twitter Bootstrap 3.2.0
Version: 1.0.0
Purchase: http://wrapbootstrap.com
-->

<html>
<!-- Head -->

<head>
  <meta charset="utf-8"/>
  <title>支付宝收银</title>
  <meta name='viewport' content='width=device-width,initail-scale=1.0'/>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

  <link rel="shortcut icon" href="<%=basePath%>resources/img/favicon.png" type="image/x-icon">

  <!--Basic Styles-->
  <link href="<%=basePath%>resources/css/bootstrap.min.css" rel="stylesheet"/>
  <link id="bootstrap-rtl-link" href="" rel="stylesheet"/>

  <link href="<%=basePath%>resources/css/font-awesome.min.css" rel="stylesheet"/>

  <!--Fonts-->
  <!-- <link href="http://fonts.useso.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,400,600,700,300" rel="stylesheet" type="text/css"> -->

  <!--Beyond styles-->
  <link id="beyond-link" href="<%=basePath%>resources/css/beyond.min.css" rel="stylesheet"/>
  <link href="<%=basePath%>resources/css/typicons.min.css" rel="stylesheet"/>
  <link href="<%=basePath%>resources/css/animate.min.css" rel="stylesheet"/>
  <link class="skin-link" href="<%=basePath%>resources/css/53A93F/skins/skin.css" rel="stylesheet" type="text/css"/>
  <link href="<%=basePath%>resources/css/dataTables.bootstrap.css" rel="stylesheet"/>

  <!-- 分页组件样式表 -->
  <link rel="stylesheet" href="<%=basePath%>resources/css/pageination.css"/>

  <!-- 个人样式表 -->
  <link class="skin-link" rel="stylesheet" href="<%=basePath%>resources/css/53A93F/personalStyle/commonStyle.css"/>
  <link class="skin-link" rel="stylesheet" href="<%=basePath%>resources/css/53A93F/personalStyle/materialControl.css"/>
</head>
<!-- /Head -->
<!-- Body -->

<body>
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
<!-- Navbar -->
<div class="navbar">
  <div class="navbar-inner">
    <div class="navbar-container">
      <!-- Navbar Barnd -->
      <div class="navbar-header pull-left">
        <a href="#" class="navbar-brand">
          <small>
            <img src="<%=basePath%>resources/img/semirlogo.png" alt=""/>
          </small>
        </a>
      </div>
      <!-- /Navbar Barnd -->
      <!-- Sidebar Collapse -->
      <div class="sidebar-collapse" id="sidebar-collapse">
        <i class="collapse-icon fa fa-bars"></i>
      </div>
      <!-- /Sidebar Collapse -->
      <ul class="sidebar_menuList">
        <li class="active transition_01">门店业务</li>
      </ul>
      <!-- Account Area and Settings --->
      <div class="navbar-header pull-right">
        <div class="navbar-account">
          <ul class="account-area">
            <li>
              <a class="login-area dropdown-toggle">
                <div class="avatar" title="View your public profile">
                  <img src="<%=basePath%>resources/img/avatars/adam-jansen.jpg">
                </div>
                <section>
                  <h2><span class="profile"><span>坏人一枚</span></span></h2>
                </section>
              </a>
              <!--Login Area Dropdown-->
              <!--/Login Area Dropdown-->
            </li>
            <!-- /Account Area -->
            <!--Note: notice that setting div must start right after account area list.
        no space must be between these elements-->
            <!-- Settings -->
          </ul>
          <div class="setting">
            <a id="btn-setting" title="Setting" href="#">
              <i class="icon fa fa-thumb-tack"></i>
            </a>
          </div>
          <div class="setting-container">
            <label>
              <input type="checkbox" id="checkbox_fixednavbar">
              <span class="text">固定头部导航</span>
            </label>
            <label>
              <input type="checkbox" id="checkbox_fixedsidebar">
              <span class="text">固定左侧菜单</span>
            </label>
          </div>
          <!-- Settings -->
        </div>
      </div>
      <!-- /Account Area and Settings -->
    </div>
  </div>
</div>
<!-- /Navbar -->
<!-- Main Container -->
<div class="main-container container-fluid">
  <!-- Page Container -->
  <div class="page-container">
    <!-- Page Sidebar -->
    <div class="page-sidebar" id="sidebar">
      <!-- /Page Sidebar Header -->
      <!-- Sidebar Menu -->
      <ul class="nav sidebar-menu">
        <!--支付宝收银-->
        <li class="active">
          <a href="<%=basePath%>orderAndPay/initPay">
            <i class="menu-icon fa fa-credit-card"></i>
            <span class="menu-text"> 支付宝收银 </span>
          </a>
        </li>
        <!--流水查询-->
        <li>
          <a href="<%=basePath%>orderAndPay/initQueryOrder">
            <i class="menu-icon fa fa-bar-chart"></i>
            <span class="menu-text"> 流水查询 </span>
          </a>
        </li>
        <!--系统配置-->
        <li>
          <a href="#" class="menu-dropdown">
            <i class="menu-icon fa fa-puzzle-piece"></i>
            <span class="menu-text"> 系统配置 </span>

            <i class="menu-expand"></i>
          </a>

          <ul class="submenu">
            <li>
              <a href="<%=basePath%>orderAndPay/initAlipayConfig">
                <span class="menu-text">支付宝配置</span>
              </a>
            </li>
          </ul>
        </li>
        <!--Forms-->
      </ul>
      <!-- /Sidebar Menu -->
    </div>
    <!-- /Page Sidebar -->
    <!-- Page Content -->
    <div class="page-content">
      <!-- Page Breadcrumb -->
      <div class="page-breadcrumbs">
        <ul class="breadcrumb">
          <li>
            <i class="fa fa-home"></i>
            <a href="#">门店业务</a>
          </li>
          <li>
            <a href="#">系统配置</a>
          </li>
          <li class="active">支付宝配置</li>
        </ul>
      </div>
      <!-- /Page Breadcrumb -->
      <!-- Page Body -->
      <div class="page-body">

        <div class="row">
          <div class="col-xs-12 col-md-12">
            <div class="well with-header with-footer">
              <div class="header bordered-success">
                支付宝配置
              </div>


              <form class="form-horizontal bv-form">
                <!-- ====================================================================================== -->
                <div class="form-group">
                  <label class="col-sm-4 control-label" style="font-size:14px;">合作者身份(PID)</label>

                  <div class="col-sm-4">
                    <input type="text" class="form-control" placeholder="合作者身份(PID)">
                    <small class="help-block">*签约的支付宝账号对应的支付宝唯一用户，以2088开头的16位纯数字组成</small>
                  </div>
                  <sup style="line-height:34px;font-size:100%;top:0;">*</sup>
                </div>
                <div class="form-group">
                  <label class="col-sm-4 control-label" style="font-size:14px;">安全验证码(KEY)</label>

                  <div class="col-sm-4">
                    <input type="text" class="form-control" placeholder="安全验证码(KEY)">
                    <small class="help-block">登录支付宝，点击【商家服务-签约管理-查看PID/KEY】，或者直接访问以下链接，可复制以上参数<br><a
                            href="https://b.alipay.com/order/pidAndKey.htm" target="_blank">https://b.alipay.com/order/pidAndKey.htm</a>
                    </small>
                  </div>
                  <sup style="line-height:34px;font-size:100%;top:0;">*</sup>
                </div>
                <div class="form-group">
                  <label class="col-sm-4 control-label" style="font-size:14px;">支付宝支付账号</label>

                  <div class="col-sm-4">
                    <input type="text" class="form-control" placeholder="支付宝支付账号">
                    <small class="help-block">您申请的支付宝登录帐号</small>
                  </div>
                  <sup style="line-height:34px;font-size:100%;top:0;">*</sup>
                </div>

                <div class="form-group">
                  <label class="col-sm-4 control-label" style="font-size:14px;">管理员手机号码</label>

                  <div class="col-sm-4">
                    <input type="text" class="form-control" placeholder="管理员手机号码">
                    <small class="help-block" style="display: none;">请输入正确的手机号码</small>
                  </div>
                  <sup style="line-height:34px;font-size:100%;top:0;">*</sup>
                </div>

                <div class="form-group">
                  <label class="col-sm-4 control-label" style="font-size:14px;">备注</label>

                  <div class="col-sm-4">
                    <textarea class="form-control" rows="6" placeholder="请输入内容"></textarea>
                  </div>
                </div>

                <div class="form-group">
                  <div class="col-sm-offset-4 col-sm-4">
                    <button class="btn btn-success btn-lg">确认</button>
                    <button class="btn btn-default btn-lg">重置</button>
                  </div>
                </div>
              </form>


            </div>
          </div>
        </div>
      </div>
      <!-- /Page Body -->
    </div>
    <!-- /Page Content -->
  </div>
  <!-- /Page Container -->
  <!-- Main Container -->

</div>

<footer>Copyright 2015 Hopedove. All Rights Reserved.</footer>


<!--Basic Scripts-->
<script src="<%=basePath%>resources/js/lib/bootstrap/jquery-2.0.3.min.js"></script>
<script src="<%=basePath%>resources/js/lib/underscore/underscore-min.js"></script>
<script src="<%=basePath%>resources/js/lib/bootstrap/bootstrap.min.js"></script>

<!--Bootstrap Date Range Picker-->
<script src="<%=basePath%>resources/js/lib/bootstrap/datetime/moment.js"></script>
<script src="<%=basePath%>resources/js/lib/bootstrap/datetime/daterangepicker.js"></script>
<script src="<%=basePath%>resources/js/lib/bootstrap/datetime/bootstrap-datepicker.js"></script>

<!--Jquery Select2-->
<script src="<%=basePath%>resources/js/lib/bootstrap/select2/select2.js"></script>

<script src="<%=basePath%>resources/js/lib/bootstrap/validation/bootstrapValidator.js"></script>

<!--Beyond Scripts-->
<script src="<%=basePath%>resources/js/lib/bootstrap/beyond.min.js"></script>

<!-- 自定义加载部分 -->
<script src='<%=basePath%>resources/js/utils/utils.js'></script>
<script src='<%=basePath%>resources/js/assets/formDemo1.js'></script>
<script>
  $(".search_more").click(function () {
    if ($(".table-toolbar").css('display') != 'none') {
      $(".table-toolbar").css('display', 'none');
      $(".search_more i").removeClass('fa-angle-up');
      $(".search_more i").addClass('fa-angle-down');
    }
    else {
      $(".table-toolbar").css('display', 'block');
      $(".search_more i").removeClass('fa-angle-down');
      $(".search_more i").addClass('fa-angle-up');
    }
  });
</script>
</body>

</html>