<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" isELIgnored="false"%>
<!DOCTYPE html>
<%@include file="/resources/common/jsp/libsTag.jsp"%>
<html>
<head>
    <meta charset="utf-8"/>
    <title>流水查询</title>
    <%@include file="/resources/common/jsp/libsCss.jsp"%>
</head>
<!-- /Head -->
<!-- Body -->

<body>
<!--导航菜单 -->
<%@include file="/resources/common/jsp/navbar_dx.jsp"%>
<!--导航菜单 结束 -->
<!-- Main Container -->
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
                                <form class="form-horizontal" role="form" action="${ctx}/orderAndPay/orderQuery">
                                    <div class="col-xs-5 col-md-5">
                                        <div class="input-group input-group-sm">
                                            <input type="text" class="form-control" name="out_trade_no" value="${out_trade_no}"  placeholder="请输入订单号">
												<span class="input-group-btn">
                                           <button class="btn btn_common_color" type="submit">搜索</button>
                                           </span>
                                        </div>
                                    </div>
                                </form>
                                <input type="hidden" id="out_trade_no_hi" value="${out_trade_no}">
                                <input type="hidden" id="trade_no_hi" value="${trade_no}">
                                <input type="hidden" id="casher_hi" value="${casher}">
                                <input type="hidden" id="store_hi" value="${store}">
                                <input type="hidden" id="begin_time_hi" value="${begin_time}">
                                <input type="hidden" id="end_time_hi" value="${end_time}">

                                <div class="col-xs-2 col-md-2 search_more">
                                    更多筛选条件<i class="fa fa-angle-down"></i>
                                </div>
                                <div class="col-xs-12 col-md-12 table-toolbar" style="display:none">
                                    <div class="row">
                                        <form class="form-horizontal" role="form"
                                              action="${ctx}/orderAndPay/orderQuery">
                                            <div class="form-group col-sm-4">
                                                <label class="col-sm-3 control-label no-padding-right">流水号</label>

                                                <div class="col-sm-9">
                                                    <input type="text" class="form-control" placeholder="流水号"
                                                           id="trade_no" name="trade_no" ${trade_no}>
                                                </div>
                                            </div>
                                            <div class="form-group col-sm-4">
                                                <label class="col-sm-3 control-label no-padding-right">收银员</label>

                                                <div class="col-sm-9">
                                                    <input type="text" class="form-control" placeholder="收银员"
                                                           id="casher" name="casher" value="${casher}">
                                                </div>
                                            </div>
                                            <div class="form-group col-sm-4">
                                                <label class="col-sm-3 control-label no-padding-right">收银门店</label>

                                                <div class="col-sm-9">
                                                    <input type="text" class="form-control" placeholder="收银门店"
                                                           id="store" name="store" value="${store}">
                                                </div>
                                            </div>
                                            <div class="form-group col-sm-4">
                                                <label class="col-sm-3 control-label no-padding-right">开始日期</label>

                                                <div class="col-sm-9">
                                                    <div class="controls">
                                                        <div class="input-group">
                                                            <input class="form-control date-picker" id="begin_time"
                                                                   name="begin_time" type="text"
                                                                   data-date-format="dd-mm-yyyy"  value="${begin_time}">
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
                                                            <input class="form-control date-picker" id="end_time"
                                                                   name="end_time" type="text"
                                                                   data-date-format="dd-mm-yyyy"  value="${end_time}">
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
                                    <b>当前收款总额：${totalFee}元</b>
                                </div>
                                <table class="table common_table common_style_table" cellspacing="0" cellpadding="0">
                                    <thead>
                                    <tr role="row">
                                        <th>订单号</th>
                                        <th>流水号</th>
                                        <th>支付方式</th>
                                        <th>交易时间</th>
                                        <th>交易状态</th>
                                        <th>总金额(元)</th>
                                        <th>收银员</th>
                                        <th>收银门店</th>
                                        <th>操作</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    <c:forEach var="item" items="${alipayOrderEntities}" varStatus="status">
                                        <tr>
                                            <td>${item.out_trade_no}</td>
                                            <td>${item.trade_no}</td>
                                            <td>${item.payMehod}</td>
                                            <td>${item.createdatetime}</td>
                                            <td>${item.result_code}</td>
                                            <td>${item.total_fee}</td>
                                            <td>${item.cashier}</td>
                                            <td>${item.storeName}</td>
                                            <td>
                                                <c:if test="${'交易成功'==item.result_code || '下单成功并且支付成功'==item.result_code}">
                                                    <button type="button" class="btn btn_common_color" onclick="doRefund(${item.out_trade_no},${item.total_fee})">退款</button></td>
                                                </c:if>

                                        </tr>
                                    </c:forEach>

                                    </tbody>
                                </table>
                                <div class="row">
                                    <div class="col-xs-12">
                                        <div id="page_ination"
                                             style="height: 40px; margin-top: 15px; display: inline-block; float: right;">
                                            <div class="paginationjs">
                                                <div class="paginationjs-pages">
                                                    <ul class="paginationjs-page J-paginationjs-page" id="pagination1"></ul>
                                                </div>
                                                <div class="paginationjs-go-input">共计${totalNum}条
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
<!-- / 弹窗 -->
<div class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
     aria-hidden="true" style="display: none;">
    <!-- <div>123123123123</div> -->
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title" id="myLargeModalLabel">退款结果</h4>
            </div>
            <div class="modal-body" id="showMessage">

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn_default" id="refundedBtn" data-dismiss="modal">确定</button>
            </div>
        </div>
    </div>
</div>
<!-- /main container -->
<%@include file="/resources/common/jsp/footer.jsp"%>
<!--Basic Scripts-->
<%@include file="/resources/common/jsp/libsJs.jsp"%>
<script src="${ctx}/resources/common/js/jqPaginator.js"></script>
<!-- 自定义加载部分 -->
<script src='${ctx}/resources/common/js/utils/utils.js'></script>
<script src='${ctx}/resources/common/js/assets/formDemo1.js'></script>
<script>
    function doRefund(out_trade_no,total_fee){
        $.post("${ctx}/orderAndPay/alipayRefund",
                {
                    "total_fee":total_fee,
                    "out_trade_no":out_trade_no
                },
                function(data){
                    $("#showMessage").text(data.result);
                    $('.bs-example-modal-sm').modal({keyboard: false});
                },'json');
    }
    $(".search_more").click(function(){
        if($(".table-toolbar").css('display')!='none'){
            $(".table-toolbar").css('display','none');
            $(".search_more i").removeClass('fa-angle-up');
            $(".search_more i").addClass('fa-angle-down');
        }
        else{
            $(".table-toolbar").css('display','block');
            $(".search_more i").removeClass('fa-angle-down');
            $(".search_more i").addClass('fa-angle-up');
        }
    });

    $("#refundedBtn").click(function(){
        var type='';

        if($("#showMessage").text().indexOf('成功退款')>=0){
            type='change';
        }
        orderQuery(type,${currentPage});
    });
    $.jqPaginator('#pagination1', {
        totalPages: ${totalPages},
        visiblePages: 3,
        currentPage: ${currentPage},
        prev: '<li class="prev"><a href="javascript:;">Previous</a></li>',
        next: '<li class="next"><a href="javascript:;">Next</a></li>',
        page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
        onPageChange: function (num, type) {
            orderQuery(type,num);
        }
    });
    function orderQuery(type,num){
        if(type=='change'){
            var out_trade_no = $("#out_trade_no_hi").val().trim();
            var trade_no = $("#trade_no_hi").val().trim();
            var casher = $("#casher_hi").val().trim();
            var store = $("#store_hi").val().trim();
            var begin_time = $("#begin_time_hi").val().trim();
            var end_time = $("#end_time_hi").val().trim();
            window.location.href = "${ctx}/orderAndPay/orderQuery?out_trade_no="+out_trade_no
                    +"&trade_no="+trade_no
                    +"&casher="+casher
                    +"&store="+store
                    +"&begin_time="+begin_time
                    +"&end_time="+end_time
                    +"&page="+num;
        }
    }

    String.prototype.trim=function(){
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }
</script>
</body>

</html>
