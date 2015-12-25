<%--
  Created by IntelliJ IDEA.
  User: xuweidong
  Date: 2015-12-25
  Time: 17:01
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
  <title>流水查询</title>
  <meta name='viewport' content='width=device-width,initail-scale=1.0'/>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

  <link rel="shortcut icon" href="/resources/img/favicon.png" type="image/x-icon">

  <!--Basic Styles-->
  <link href="/resources/css/bootstrap.min.css" rel="stylesheet"/>
  <link id="bootstrap-rtl-link" href="" rel="stylesheet"/>

  <link href="/resources/css/font-awesome.min.css" rel="stylesheet"/>

  <!--Fonts-->
  <!-- <link href="http://fonts.useso.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,400,600,700,300" rel="stylesheet" type="text/css"> -->

  <!--Beyond styles-->
  <link id="beyond-link" href="/resources/css/beyond.min.css" rel="stylesheet"/>
  <link href="/resources/css/typicons.min.css" rel="stylesheet"/>
  <link href="/resources/css/animate.min.css" rel="stylesheet"/>
  <link class="skin-link" href="/resources/css/53A93F/skins/skin.css" rel="stylesheet" type="text/css"/>
  <link href="/resources/css/dataTables.bootstrap.css" rel="stylesheet"/>

  <!-- 分页组件样式表 -->
  <link rel="stylesheet" href="/resources/css/pageination.css"/>

  <!-- 个人样式表 -->
  <link class="skin-link" rel="stylesheet" href="/resources/css/53A93F/personalStyle/commonStyle.css"/>
  <link class="skin-link" rel="stylesheet" href="/resources/css/53A93F/personalStyle/materialControl.css"/>
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
            <img src="/resources/img/semirlogo.png" alt=""/>
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
                  <img src="/resources/img/avatars/adam-jansen.jpg">
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
          <a href="<%=basePath%>/orderAndPay/initPay">
            <i class="menu-icon fa fa-credit-card"></i>
            <span class="menu-text"> 支付宝收银 </span>
          </a>
        </li>
        <!--流水查询-->
        <li>
          <a href="<%=basePath%>/orderAndPay/initQueryOrder">
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
              <a href="<%=basePath%>/orderAndPay/initAlipayConfig">
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
          <li class="active">流水查询</li>
        </ul>
      </div>
      <!-- /Page Breadcrumb -->
      <!-- Page Body -->
      <div class="page-body">

        <div class="row">
          <div class="col-xs-12 col-md-12">
            <div class="well with-header">
              <div class="header bordered-success">
                流水查询
              </div>
              <div class="row">
                <div class="col-xs-5 col-md-5">
                  <div class="input-group input-group-sm">
                    <input type="text" class="form-control" id="out_trade_no">
												<span class="input-group-btn">
                                           <button class="btn btn_common_color" id="searchBtn" type="button">搜索</button>
                                           </span>
                  </div>
                </div>
                <div class="col-xs-2 col-md-2 search_more">
                  更多筛选条件<i class="fa fa-angle-down"></i>
                </div>
                <div class="col-xs-12 col-md-12 table-toolbar" style="display:none">
                  <div class="row">
                    <form class="form-horizontal" role="form">
                      <div class="form-group col-sm-4">
                        <label class="col-sm-3 control-label no-padding-right">流水号</label>

                        <div class="col-sm-9">
                          <input type="text"  class="form-control" placeholder="流水号" id="trade_no">
                        </div>
                      </div>
                      <div class="form-group col-sm-4">
                        <label class="col-sm-3 control-label no-padding-right" >收银员</label>

                        <div class="col-sm-9">
                          <input type="text" class="form-control" placeholder="收银员" id="casher">
                        </div>
                      </div>
                      <div class="form-group col-sm-4">
                        <label class="col-sm-3 control-label no-padding-right">收银门店</label>

                        <div class="col-sm-9">
                          <input type="text" class="form-control" placeholder="收银门店" id="store">
                        </div>
                      </div>
                      <div class="form-group col-sm-4">
                        <label class="col-sm-3 control-label no-padding-right">开始日期</label>

                        <div class="col-sm-9">
                          <div class="controls">
                            <div class="input-group">
                              <input class="form-control date-picker"
                                     id="begin-date-picker" type="text"
                                     data-date-format="dd-mm-yyyy">
                                                                    <span class="input-group-addon">
                                                                        <i class="fa fa-calendar"></i>
                                                                    </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="form-group col-sm-4">
                        <label class="col-sm-3 control-label no-padding-right">结束日期</label>

                        <div class="col-sm-9">
                          <div class="controls">
                            <div class="input-group">
                              <input class="form-control date-picker"
                                     id="end-date-picker" type="text"
                                     data-date-format="dd-mm-yyyy">
                                                                    <span class="input-group-addon">
                                                                        <i class="fa fa-calendar"></i>
                                                                    </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="form-group col-sm-4">
                        <div class="col-sm-offset-3 col-sm-9">
                          <button type="submit" class="btn btn_common_color">搜索</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div class="dataTables_wrapper form-inline no-footer">
              <div class="toolbar_padd_bot">
                <b>当前收款总额：300元</b>
              </div>
              <table class="table common_table common_style_table" cellspacing="0" cellpadding="0">
                <thead>
                <tr role="row">
                  <th class='align_center' style="width: 35px;">
                    <div class="common_table_checkbox inline_block">
                      <label>
                        <input type="checkbox" class="colored-common" checked="checked">
                        <span class="text common_color_checkbox"></span>
                      </label>
                    </div>
                  </th>
                  <th>订单号</th>
                  <th>流水号</th>
                  <th>支付方式</th>
                  <th>交易时间</th>
                  <th>交易状态</th>
                  <th>总金额(元)</th>
                  <th>收银员</th>
                  <th>收银门店</th>
                </tr>
                </thead>

                <tbody>
                <tr>
                  <td class='align_center'>
                    <div class="common_table_checkbox inline_block">
                      <label>
                        <input type="checkbox" value='11' data-tabel-control='child'
                               class="colored-common" checked="checked">
                        <span class="text common_color_checkbox"></span>
                      </label>
                    </div>
                  </td>
                  <td>DD20151205312654</td>
                  <td>DEHGJHG201544121565312654</td>
                  <td>支付宝支付</td>
                  <td>2015-12-25&nbsp;12:00:00</td>
                  <td>成功</td>
                  <td>200</td>
                  <td>珠峰</td>
                  <td>上海闵行杨浦区七桥国际儿童MALL</td>
                </tr>
                <tr>
                  <td class='align_center'>
                    <div class="common_table_checkbox inline_block">
                      <label>
                        <input type="checkbox" value='11' data-tabel-control='child'
                               class="colored-common" checked="checked">
                        <span class="text common_color_checkbox"></span>
                      </label>
                    </div>
                  </td>
                  <td>DD20151205312654</td>
                  <td>DEHGJHG201544121565312654</td>
                  <td>微信支付</td>
                  <td>2015-12-25&nbsp;12:00:00</td>
                  <td>成功</td>
                  <td>200</td>
                  <td>张兆军</td>
                  <td>上海闵行杨浦区七桥国际儿童MALL</td>
                </tr>
                <tr>
                  <td class='align_center'>
                    <div class="common_table_checkbox inline_block">
                      <label>
                        <input type="checkbox" value='11' data-tabel-control='child'
                               class="colored-common" checked="checked">
                        <span class="text common_color_checkbox"></span>
                      </label>
                    </div>
                  </td>
                  <td>DD20151205312654</td>
                  <td>DEHGJHG201544121565312654</td>
                  <td>微信支付</td>
                  <td>2015-12-25&nbsp;12:00:00</td>
                  <td>成功</td>
                  <td>200</td>
                  <td>张华</td>
                  <td>上海闵行杨浦区七桥国际儿童MALL</td>
                </tr>
                </tbody>
              </table>
              <div class="row">
                <div class="col-xs-12">
                  <div id="page_ination"
                       style="height: 40px; margin-top: 15px; display: inline-block; float: right;">
                    <div class="paginationjs">
                      <div class="paginationjs-pages">
                        <ul>
                          <li class="paginationjs-prev disabled"><a><</a></li>
                          <li class="paginationjs-page J-paginationjs-page active"><a>1</a>
                          </li>
                          <li class="paginationjs-next disabled"><a>></a></li>
                        </ul>
                      </div>
                      <div class="paginationjs-go-input">共计10条 <input type="text" id="gonum"
                                                                      name="gonum"
                                                                      class="J-paginationjs-go-pagenumber">
                      </div>
                      <div class="paginationjs-go-button"><input type="button"
                                                                 class="J-paginationjs-go-button"
                                                                 value="Go"
                                                                 onclick="javascript:go2page(1)">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
<script src="/resources/js/lib/bootstrap/jquery-2.0.3.min.js"></script>
<script src="/resources/js/lib/underscore/underscore-min.js"></script>
<script src="/resources/js/lib/bootstrap/bootstrap.min.js"></script>

<!--Bootstrap Date Range Picker-->
<script src="/resources/js/lib/bootstrap/datetime/moment.js"></script>
<script src="/resources/js/lib/bootstrap/datetime/daterangepicker.js"></script>
<script src="/resources/js/lib/bootstrap/datetime/bootstrap-datepicker.js"></script>

<!--Jquery Select2-->
<script src="/resources/js/lib/bootstrap/select2/select2.js"></script>

<script src="/resources/js/lib/bootstrap/validation/bootstrapValidator.js"></script>

<!--Beyond Scripts-->
<script src="/resources/js/lib/bootstrap/beyond.min.js"></script>

<!-- 自定义加载部分 -->
<script src='/resources/js/utils/utils.js'></script>
<script src='/resources/js/assets/formDemo1.js'></script>
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
  $(function(){

  });
  function createTable(){
    var out_trade_no = $("#out_trade_no").val();
    var trade_no = $("#trade_no").val();
    var casher = $("#casher").val();
    var store = $("#store").val();
    var begin_time = $("#begin-date-picker").val();
    var end_time = $("#end-date-picker").val();

  }
</script>
</body>

</html>
