<%@page import="com.cccis.foundation.authentication.AuthenticationUtils"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://jawr.net/tags-el" prefix="jwr"%>
<%@ taglib uri="/cccTaglib" prefix="ccc"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <%
        String username = AuthenticationUtils.getCurrentName();
        pageContext.setAttribute("username", username);
    %>
    <title><ccc:stringResource resCode="RES_3231" defaultValue="修理厂管理"/></title>
    <jwr:style src="${request.contextPath}/bundles/webEs.css" />
    <jwr:style src="${request.contextPath}/bundles/webEsMedia.css"/>
    <jwr:style src="${request.contextPath}/bundles/webEsSystemConfig.css"/>
</head>
<body>
<script type="application/javascript">
    var isReadonly = ${readonly};
</script>
<div class="topHeader" ></div>
	<div class="wrap" style="">
        <%@ include file="/WEB-INF/pages/pub/top.jsp" %>
		<div class="topNav">
             <div class="topLogo"></div>
             <div class="topNavInfo">
             	<span id="caseReamrkBtn" class="button">
                    <span class="buttonText">
                        <span class="remarkImg"></span>
                        <ccc:stringResource resCode="RES_1454" defaultValue="备 注"/>
                    </span>
                </span>
                 <span class="topNavSeprateLine"></span>
             	<span id="saveRepairFactory" class="button">
                    <span class="buttonText">
                        <span class="SaveImg"></span>
                        <ccc:stringResource resCode="RES_210" defaultValue="保 存"/>
                    </span>
                </span>
                 <span class="topNavSeprateLine"></span>
             	<span id="submitRepairFactory" class="button">
                    <span class="buttonText">
                        <span class="SubmitImg"></span>
                        <ccc:stringResource resCode="RES_1455" defaultValue="提 交"/>
                    </span>
                </span>
             </div>
             <div class="login">
              <span class="login_wel"><strong class="whiteColor"><ccc:stringResource resCode="RES_214" defaultValue="欢迎,"/><c:out value="${username}"/></strong></span>
             </div>
             <div class="clear"></div>
         </div>
        <ccc:jspInclude file="/WEB-INF/pages/sysmanagement/admin/repairFactory/repairFactoryKeyInfo.jsp"/>
        <div id="repairFactoryInfoTabStrip" style="margin:5px 0px 0px 0px">
            <ul class="leavelOneTab">
                <li id="repairFactoryInfoTab" ><ccc:stringResource resCode="RES_329" defaultValue="修理厂信息"/></li>
                <li id="partDiscountRateTab" ><ccc:stringResource resCode="RES_2296" defaultValue="进销差率"/></li>
                <li id="laborDiscountRateTab" ><ccc:stringResource resCode="RES_2680" defaultValue="工时折扣率"/></li>
            </ul>
            <div class="tabcontent">
                <ccc:jspInclude file="/WEB-INF/pages/sysmanagement/admin/repairFactory/repairFactoryBaseInfo.jsp"/>
            </div>
            <div class="tabcontent">
                <ccc:jspInclude file="/WEB-INF/pages/sysmanagement/admin/repairFactory/partDiscountRateInfo.jsp"/>
            </div>
            <div class="tabcontent">
                <ccc:jspInclude file="/WEB-INF/pages/sysmanagement/admin/repairFactory/hourDiscountRateInfo.jsp"/>
            </div>
        </div>
	</div>
<%@include file="/WEB-INF/pages/sysmanagement/admin/selectAccAppraiserWindow.jsp" %>
<%@include file="/WEB-INF/pages/sysmanagement/admin/selectRepairCoBrandsWindow.jsp" %>
<%@include file="/WEB-INF/pages/sysmanagement/admin/repairFactory/selectRfCoBrandSeriesWindow.jsp" %>
<%@include file="/WEB-INF/pages/pub/bottom.jsp"%>
<ccc:jspInclude file="/WEB-INF/pages/pub/copyright.jsp"/>
<jwr:script src="/bundles/repairFactoryInfo.js"/>
</body>
</html>