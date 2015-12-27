<%--
  Created by IntelliJ IDEA.
  User: xuweidong
  Date: 2015-12-25
  Time: 17:01
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%--<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>--%>
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
                    <input type="text" class="form-control" id="out_trade_no" name="out_trade_no" value="${out_trade_no}">
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
                          <input type="text"  class="form-control" placeholder="流水号" id="trade_no" name="trade_no" value="${trade_no}">
                        </div>
                      </div>
                      <div class="form-group col-sm-4">
                        <label class="col-sm-3 control-label no-padding-right" >收银员</label>

                        <div class="col-sm-9">
                          <input type="text" class="form-control" placeholder="收银员" id="casher" name="casher" value="${casher}">
                        </div>
                      </div>
                      <div class="form-group col-sm-4">
                        <label class="col-sm-3 control-label no-padding-right">收银门店</label>

                        <div class="col-sm-9">
                          <input type="text" class="form-control" placeholder="收银门店" id="store" name="store" value="${store}">
                        </div>
                      </div>
                      <div class="form-group col-sm-4">
                        <label class="col-sm-3 control-label no-padding-right">开始日期</label>

                        <div class="col-sm-9">
                          <div class="controls">
                            <div class="input-group">
                              <input class="form-control date-picker"
                                     id="begin-date-picker" type="text"
                                     data-date-format="dd-mm-yyyy" name="begin_time" >
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
                                     data-date-format="dd-mm-yyyy" name="end_time" >
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
                <b>当前收款总额：${totalMoney}元</b>
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
                         <%-- <ul class="paginationjs-page J-paginationjs-page active" id="pagination1"></ul>--%>
                        <%--<ul>
                          <li class="paginationjs-prev disabled"><a><</a></li>
                          <li class="paginationjs-page J-paginationjs-page active"><a>1</a>
                          </li>
                          <li class="paginationjs-next disabled"><a>></a></li>
                        </ul>--%>
                      </div>
                      <div class="paginationjs-go-input">共计${total}条
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
<script src="<%=basePath%>resources/js/jqPaginator.js"></script>
<script>
  $(function(){
      var totalPages=1;
      $.jqPaginator('#pagination1', {
          totalPages: ${totalPages},
          visiblePages: 10,
          currentPage: 1,
          prev: '<li class="prev"><a href="javascript:;">Previous</a></li>',
          next: '<li class="next"><a href="javascript:;">Next</a></li>',
          page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
          onPageChange: function (num, type) {
              $('#p2').text(type + '：' + num);
          }
      });
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
