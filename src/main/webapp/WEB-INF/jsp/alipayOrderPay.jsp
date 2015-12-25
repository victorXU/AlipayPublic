<%--
  Created by IntelliJ IDEA.
  User: xuweidong
  Date: 2015-12-24
  Time: 19:54
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

    <link rel="shortcut icon" href="/resources/img/favicon.png" type="image/x-icon">

    <!--Basic Styles-->
    <link href="/resources/css/bootstrap.min.css" rel="stylesheet"/>
    <link id="bootstrap-rtl-link" href="" rel="stylesheet"/>

    <link href="/resources/css/font-awesome.min.css" rel="stylesheet"/>

    <!--Fonts-->
    <!-- <link href="http://fonts.useso.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,400,600,700,300" rel="stylesheet" type="text/css"> -->

    <!--Beyond styles-->
    <link id="beyond-link" href="/resources/css/beyond.min.css" rel="stylesheet"/>
    <link href="/css/typicons.min.css" rel="stylesheet"/>
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
                    <li class="active">支付宝收银</li>
                </ul>
            </div>
            <!-- /Page Breadcrumb -->
            <!-- Page Body -->
            <div class="page-body">

                <div class="row">
                    <div class="col-xs-12 col-md-12">
                        <div class="well with-header with-footer">
                            <div class="header bordered-success">
                                支付宝收银
                            </div>
                            <form class="form-horizontal bv-form padding-top-30">
                                <!-- ====================================================================================== -->
                                <div class="form-group">
                                    <label class="col-sm-4 control-label" style="font-size:20px; padding-top: 26px;">本次收款金额</label>

                                    <div class="col-sm-4">
                                                    <span class="input-icon icon-right">
                                                        <input type="text" class="form-control input-xl" id="total_fee" name="total_fee"
                                                               placeholder="本次收款金额">
                                                        <i class="fa fa-rmb success"></i>
                                                    </span>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-4 control-label" style="font-size:20px; padding-top: 26px;">支付宝条形码</label>

                                    <div class="col-sm-4">
                                                    <span class="input-icon icon-right">
                                                        <input type="text" class="form-control input-xl" id="dynamic_id" name="dynamic_id"
                                                               placeholder="支付宝条形码">
                                                        <i class="fa fa-barcode success"></i>
                                                    </span>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <div class="col-sm-offset-4 col-sm-4">
                                        <input class="btn btn-success btn-block" style="padding: 12px; font-size: 20px;"
                                               type="button" value="支付" data-toggle="modal" id="paybtn"
                                               data-target=".bs-example-modal-sm">
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
<!-- / 弹窗 -->
<div class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
     aria-hidden="true" style="display: none;">
    <!-- <div>123123123123</div> -->
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title" id="myLargeModalLabel">支付结果</h4>
            </div>
            <div class="modal-body" id="showMessage">
                您已成功收款：100元
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn_default" data-dismiss="modal">取消</button>
                <button type="button" class="btn btn_common">确定</button>
            </div>
        </div>
    </div>
</div>


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
    $("#paybtn").on("click",function(){
        var total_fee = $("#total_fee").val();
        var dynamicId = $("#dynamic_id").val();
        if(total_fee==""){
            alert("金额不能为空");
            $("#total_fee").focus();
            return;
        }else{
            if(!isNumeric(total_fee)){
                alert("金额只能输入数字");
                $("#total_fee").focus();
                return;
            }
        }
        if(dynamicId==""){
            alert("支付宝条码不能为空");
            $("#dynamic_id").focus();
            return;
        }else{
            if(!isNumeric(dynamicId)){
                alert("支付宝条码只能输入数字");
                $("#dynamic_id").focus();
                return;
            }
        }
        $('#myModal').modal({keyboard: false});
        //$('#myModal').modal('toggle');
        $.post("<%=basePath%>orderAndPay/alipayOrderPay",
                {
                    "total_fee":total_fee,
                    "dynamic_id":dynamicId,
                },
                function(data){
//                    $('#myModal').modal('hide');
                    if(data.responseStr==''){
                        alert(data.trade_status);
                        $("#tradeNo").val(data.trade_no);
                        if(data.trade_status=="交易成功"||data.trade_status=="交易成功且结束"||data.trade_status=="关闭的交易"){
                           alert(data.trade_status);
                        }else {
                            if(data.trade_status=="交易创建，等待买家付款"||data.trade_status=="等待卖家收款"){
                                $.post("${path}/orderAndPay/alipayOrderQuery",
                                        {
                                            "trade_no":data.trade_no
                                        },
                                        function(data){
                                            if(data.result!=""){
                                                alert(data.result);
                                            }else{
                                                $("#trade_no").text(data.trade_no);
                                                $("#send_pay_date").text(data.send_pay_date);
                                                $("#total_fee").text(data.total_fee+'元');
                                                $("#trade_status").text(data.trade_status);
                                                $("#orderInfo").show(1000);
                                                $("#searchBtn").focus();
                                            }
                                        },'json'
                                );
                            }
                            $("#searchBtn").focus();
                        }

                    }else{
                        alert(data.responseStr);
                        $("#dynamic_id").val('');
                        $("#dynamic_id").focus();
                    }

                },'json');
    });
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

    function isNumeric(a)
    {
        //var reg=/^(-|+)?d+(.d+)?$/;
        var reg=/^([0-9]*|[0-9]{1}\d*\.\d{1}?\d*)$/;
        return(reg.test(a));
    }
</script>
</body>

</html>