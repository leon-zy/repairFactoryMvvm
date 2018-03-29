<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ taglib uri="/cccTaglib" prefix="ccc"%>
<%@ taglib uri="http://jawr.net/tags-el" prefix="jwr"%>
<div id="partDiscountRateInfoTabStrip" class="secTabStrip">
	<ul class="secTab" style="display:none;">
		<li id="partDisRateMajorMakeTypeTab"  parentTab="partDiscountRateTab"><ccc:stringResource resCode="RES_3288" defaultValue="承修厂牌"/></li>
    </ul>
	<div class="tabcontent">
		<ccc:jspInclude file="/WEB-INF/pages/sysmanagement/admin/repairFactory/partDisRateVehicleInfo.jsp" />
	</div>
</div>
<%@include file="/WEB-INF/pages/pub/bottom.jsp"%>
