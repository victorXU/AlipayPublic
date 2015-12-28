<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" isELIgnored="false"%>
<!DOCTYPE html>
<%@include file="/resources/common/jsp/libsTag.jsp"%>
<html>
<head>
    <meta charset="utf-8"/>
    <title>支付宝收银</title>
    <input type="hidden" name="menuCodeDefault" id="menuCodeDefault" value="O_SMS_M010" />
    <%@include file="/resources/common/jsp/libsCss.jsp"%>
</head>
<!-- /Head -->
<!-- Body -->

<body>
<!--导航菜单 -->
<%@include file="/resources/common/jsp/navbar_dx.jsp"%>
<!--导航菜单 结束 -->
<!-- Main Container -->
<div class="main-container container-fluid">
    <!-- Page Container -->
    <div class="page-container">
        <!-- Page Sidebar -->
        <%@include file="/resources/common/jsp/menu1.jsp"%>
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
                                                        <input type="text" class="form-control" style="height: 60px;" id="total_fee" name="total_fee"
                                                               placeholder="本次收款金额">
                                                        <i class="fa fa-rmb success" style="padding-top:4%"></i>
                                                    </span>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-4 control-label" style="font-size:20px; padding-top: 26px;">支付宝条形码</label>

                                    <div class="col-sm-4">
                                                    <span class="input-icon icon-right">
                                                        <input type="text" class="form-control" style="height: 60px;" id="dynamic_id" name="dynamic_id"
                                                               placeholder="支付宝条形码">
                                                        <i class="fa fa-barcode success" style="padding-top:4%"></i>
                                                    </span>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <div class="col-sm-offset-4 col-sm-4">
                                        <input class="btn btn-success btn-block" style="padding: 12px; font-size: 20px;"
                                               type="button" value="支付" data-toggle="modal" id="paybtn">
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
                <button type="button" class="btn btn_default" data-dismiss="modal">确定</button>
            </div>
        </div>
    </div>
</div>


<!-- /main container -->
<%@include file="/resources/common/jsp/footer.jsp"%>
<!--Basic Scripts-->
<%@include file="/resources/common/jsp/libsJs.jsp"%>
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
        $.post("${ctx}/orderAndPay/alipayOrderPay",
                {
                    "total_fee":total_fee,
                    "dynamic_id":dynamicId
                },
                function(data){
//                    $('#myModal').modal('hide');
                    if(data.responseStr==''){
                        $("#showMessage").text(data.trade_status);
                    }else{
                        $("#showMessage").text(data.responseStr);
                    }
                    $('.bs-example-modal-sm').modal({keyboard: false});
                },'json');
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