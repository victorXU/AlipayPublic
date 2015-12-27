<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" isELIgnored="false"%>
<!DOCTYPE html>
<%@include file="/resources/common/jsp/libsTag.jsp"%>
<html>
<head>
<meta charset="utf-8" />
<title><sitemesh:title/></title>
<%@include file="/resources/common/jsp/libsCss.jsp"%>
<sitemesh:head/>
</head>
<body>
<!--导航菜单 -->
<%@include file="/resources/common/jsp/navbar_dx.jsp"%>
<!--导航菜单 结束 -->
<!-- main container -->
<div class='main-container'>
    <!-- 内部层，加上一个相对定位为下面的定位做准备 -->
    <div class="page-container">
        <!-- 左侧菜单 -->
        <%@include file="/resources/common/jsp/menu1.jsp"%>
        <!-- 左侧菜单 结束-->
        <!-- *******************右下侧页面内容部分******************* -->
        <sitemesh:body/>
        <!-- /右下侧页面内容部分 -->
    </div>
</div>
<!-- /main container -->
<%@include file="/resources/common/jsp/footer.jsp"%>
<!--Basic Scripts-->
<%@include file="/resources/common/jsp/libsJs.jsp"%>
</body>
</html>