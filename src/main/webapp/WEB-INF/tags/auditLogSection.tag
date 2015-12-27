<%@tag pageEncoding="UTF-8" %>
<%@ attribute name="resourceId" type="java.lang.Integer" rtexprvalue="true" required="true" %>
<%@ attribute name="resourceType" type="java.lang.String" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}"/>
<div class="row-fluid">
    <div class="span12">
        <div class="portlet box grey">
            <div class="portlet-title">
                <h4>修改历史</h4>
            </div>
            <div id="auditLog_list_container" class="portlet-body lazy-section"
                 base-url="${ctx}/auditlog/auditLogListSection?resourceType=${resourceType}&resourceId=${resourceId}"></div>
        </div>
    </div>
</div>