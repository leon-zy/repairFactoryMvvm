<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ taglib uri="/cccTaglib" prefix="ccc"%>
<%@ taglib uri="http://jawr.net/tags-el" prefix="jwr"%>

<div id="partDisRateVehicleInfoDiv" class="window-content">
    <div>
        <table>
            <col width="8%"/>
            <col width="15%"/>
            <col width="15%"/>
            <col width="15%"/>
            <col width="15%"/>
            <col width="15%"/>
            <col width="15%"/>
            <col width="2%"/>
            <tr>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td colspan="6">
                    <div id="partDisRateVehicleInfoDetail">
                        <span class="comBtn button mgR5px" data-bind="click: addAllParam">
                            <span class="buttonText IcoTextBtnBox">
                                <span class="btnAddIco"></span>
                                <label>
                                    <ccc:stringResource resCode="RES_359" defaultValue="新增"/><ccc:stringResource resCode="RES_898" defaultValue="全部"/><ccc:stringResource resCode="RES_33" defaultValue="厂牌"/>
                                </label>
                            </span>
                        </span>
                        <span class="comBtn button mgR5px" data-bind="click: checkVehicleMakeList">
                            <span class="buttonText IcoTextBtnBox">
                                <span class="btnAddIco"></span>
                                <label>
                                    <ccc:stringResource resCode="RES_359" defaultValue="新增"/><ccc:stringResource resCode="RES_172" defaultValue="车系"/>
                                </label>
                            </span>
                        </span>
                        <span class="comBtn button" data-bind="click: deleteParam">
                            <span class="buttonText IcoTextBtnBox">
                                <span class="btnDeleteIco"></span>
                                <label>
                                    <ccc:stringResource resCode="RES_360" defaultValue="删除"/>
                                </label>
                            </span>
                        </span>
                        <div class="grayBorderBottom marginT7 paddingR16" id="partDisRateVehicleDataGridTitle">
                            <table class="repairFactoryTable dropdownBox">
                                <colgroup>
                                    <col width="5%" />
                                    <col width="15%" />
                                    <col width="30%" />
                                    <col width="12%" />
                                    <col width="12%" />
                                    <col width="10%" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th rowspan="2" class="titleCenter oneTitle">
                                            <input type='checkbox' data-bind="click: selectAll, checked: selectAllFlag"/>
                                        </th>
                                        <th rowspan="2" class="titleCenter oneTitle">
                                            <ccc:stringResource resCode="RES_33" defaultValue="厂牌"/>
                                        </th>
                                        <th rowspan="2" class="titleCenter oneTitle">
                                            <ccc:stringResource resCode="RES_172" defaultValue="车系"/>
                                        </th>
                                        <th rowspan="2" class="titleCenter oneTitle">
                                            <ccc:stringResource resCode="RES_354" defaultValue="配件渠道"/>
                                        </th>
                                        <th rowspan="2" class="titleCenter oneTitle">
                                            <ccc:stringResource resCode="RES_2296" defaultValue="进销差率"/>
                                        </th>
                                        <th rowspan="2" class="titleCenter oneTitle">
                                            <ccc:stringResource resCode="RES_2707" defaultValue="专属厂牌"/>
                                        </th>
                                    </tr>
                                    <tr></tr>
                                </thead>
                            </table>
                        </div>
                        <div class="marginB10 k-div-table" name="partDisRateVehicleDataGrid">
                            <table class="repairFactorySubTable dropdownBox" style="height: auto;">
                                <colgroup>
                                    <col width="5%" />
                                    <col width="15%" />
                                    <col width="30%" />
                                    <col width="12%" />
                                    <col width="12%" />
                                    <col width="10%" />
                                </colgroup>
                                <tbody data-template="partDisRateVehicleDataGrid-template" data-bind="source: partDisRateData"></tbody>
                            </table>
                        </div>
                        <script id="partDisRateVehicleDataGrid-template" type="text/x-kendo-template">
                            <tr id="partDisRate_#:uid#">
                                <td style="text-align: center" >
                                    <input type='checkbox' data-bind="checked: checked, click: clickSingleSelect"/>
                                </td>
                                <td name="vehicleMakeId" data-bind="text:vehicleMakeName">
                                </td>
                                <td name="vehicleSeriesId" data-bind="text:vehicleSeriesName">
                                </td>
                                <td name="partType">
                                     <span id="partType_#:uid#" class="cursorEdit speed lineheight28 text-valign-m" data-bind="text:partTypeName, events:{click : showDropDownList, blur : hideDropDownList}"></span>
                                </td>
                                <td>
                                    <span name="partDiscount" class="speed">
                                        <input type="text" style="ime-mode: disabled;" class="k-textbox widthP100"
                                               data-role="numerictextbox" data-format="\\#,\\#.00\\#\\#" data-decimals="2" data-max="999.99" data-min="0"
                                               data-bind="value: discountRate" maxlength="10"/>
                                        <span class="kilometre"><ccc:stringResource resCode="RES_2331" defaultValue="%"/></span>
                                    </span>
                                </td>
                                <td name="discountType" style="text-align: center" data-bind="text:discountTypeName"></td>
                            </tr>
                        </script>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</div>
<%@include file="/WEB-INF/pages/pub/bottom.jsp"%>
