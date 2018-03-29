
var RepairFactoryBaseInfoView = (function ($) {

    var REPAIR_FACTORY_MESSAGE = stringResourceMap.get("RES_329");// 修理厂信息。
    var REPAIR_CODE_DUPLICATE = stringResourceMap.get("RES_2184");//	修理厂编码重复
    var REPAIR_NAME_DUPLICATE = stringResourceMap.get("RES_2186");//	修理厂名称重复。
    var MSG_CHANGE_COMPANY = stringResourceMap.get("RES_2622");//是否修改关联机构？
    var pleaseSelect = stringResourceMap.get("RES_180");//请选择

    var $mdVehicleMakeNamesForMajor = null; //承修合作厂牌显示框
    var $btnCoBrandsForMajor = null;//搜索：承修合作厂牌

    var $relateCompany;
    var kendoRelateCompany;
    var $accreditedAppraiserId;//派驻定损员
    var $appraiserCompanyId;//派驻定损员所属机构
    var $btnSearchAppraiser; //搜索：派驻定损员
    var $txtPartnerShip;
    var txtPartnerShip;
    var $repairFactoryCode;
    var $txtRepairFactoryName;

    /**
     * 初始化页面UI
     */
    var initUI = function () {
        initKendoUIExtPoint();
    };

    var initJQueryObjects = function () {
        $mdVehicleMakeNamesForMajor = $("#vehicleMakeNames1");
        $btnCoBrandsForMajor = $("#btnCoBrands1");
        $relateCompany = $("#relateCompany");
        $accreditedAppraiserId = $("#accreditedAppraiserId");
        $appraiserCompanyId = $("#appraiserCompanyId");
        $btnSearchAppraiser = $("#btnSearchAppraiser");
        $txtPartnerShip=$("#txtPartnerShip");
        $repairFactoryCode = $("#txtRepairFactoryCode");
        $txtRepairFactoryName = $("#txtRepairFactoryName");
    };

    /**
     * 初始化控件
     */
    var initKendoUIExtPoint = function () {
        //初始化code table
        CodeTable.initCodeTable($("#cboRepairFactoryType,#txtPartnerShip"));

        $("#pnlRepairFactoryInfo").kendoPanelBar({
            expandMode: "multiple",
            animation: false
        });

        KendoUtils.initNumericTextBox({
            id: "#txtMachinistRate",
            format: NUMBER_FORMAT.STR_FORMAT_4DOT,
            max: NUMBER_FORMAT.STR_FORMAT_MFR_MAX,
            min: DECIMAL_DIGITS.DECIMAL_DIGITS_0,
            decimals: DECIMAL_DIGITS.DECIMAL_DIGITS_2
        });
        KendoUtils.initNumericTextBox({
            id: "#txtSheetMetalRate",
            format: NUMBER_FORMAT.STR_FORMAT_4DOT,
            max: NUMBER_FORMAT.STR_FORMAT_MFR_MAX,
            min: DECIMAL_DIGITS.DECIMAL_DIGITS_0,
            decimals: DECIMAL_DIGITS.DECIMAL_DIGITS_2
        });
        KendoUtils.initNumericTextBox({
            id: "#txtPaintRate",
            format: NUMBER_FORMAT.STR_FORMAT_4DOT,
            max: NUMBER_FORMAT.STR_FORMAT_MFR_MAX,
            min: DECIMAL_DIGITS.DECIMAL_DIGITS_0,
            decimals: DECIMAL_DIGITS.DECIMAL_DIGITS_2
        });
    };

    /**
     * 加载页面数据
     */
    var initPageData = function () {
        sysRepairFactoryDataModel.get().done(function() {
            if (sysRepairFactoryDataModel.repairFactoryId) {
                setSysRepairFactoryInfoData();
            }
            //初始化关联机构树
            kendoRelateCompany = $relateCompany.cccDropDownTree({
                companyId: USERMODEL.companyId,
                selectedCompanyId: sysRepairFactoryDataModel.companyId || USERMODEL.companyId,
                isInvalidCompany: true
            }).data("cccDropDownTree");
        });
    };

    // 初始化页面数据
    var setSysRepairFactoryInfoData = function () {
        var sysRepairFactoryInfo = sysRepairFactoryDataModel;
        if (sysRepairFactoryInfo) {
            $("#txtRepairFactoryCode").val(sysRepairFactoryInfo.repairFactoryCode);
            $("#txtRepairFactoryName").val(sysRepairFactoryInfo.repairFactoryName);
            $("#txtContactInfo").val(sysRepairFactoryInfo.contactInfo);
            $("#txtContactInfo").attr('title',sysRepairFactoryInfo.contactInfo);
            $("#txtRepairFactoryAddress").val(sysRepairFactoryInfo.address);
            $("#txtRepairFactoryAddress").attr('title',sysRepairFactoryInfo.address);
            $("#txtCompanyName").val(sysRepairFactoryInfo.companyName);
            $("#txtRepairFactoryInfoRemark").val(sysRepairFactoryInfo.remark);
            $("#txtRepairFactoryName").attr("title", sysRepairFactoryInfo.repairFactoryName);
            KendoUtils.setKendoDropdownlistValue("cboRepairFactoryType", sysRepairFactoryInfo.repairFactoryLevel);
            KendoUtils.setKendoDropdownlistValue("txtPartnerShip", sysRepairFactoryInfo.partnerShip);
            $mdVehicleMakeNamesForMajor.val(sysRepairFactoryInfo.vehicleManufMakeNameStr); //专修合作厂牌
            $mdVehicleMakeNamesForMajor.data("uid",sysRepairFactoryInfo.vehicleMakeIdStr);
            $("#txtRepairFactoryInfoRemark").trigger("change");
            /*kendoRelateCompany.selectCompany(sysRepairFactoryInfo.companyId, false);
            kendoRelateCompany.value(sysRepairFactoryInfo.companyId);*/
            KendoUtils.setKendoNumricTextValue("txtMachinistRate", sysRepairFactoryInfo.electricianMachinistRate);
            KendoUtils.setKendoNumricTextValue("txtSheetMetalRate", sysRepairFactoryInfo.sheetMetalRate);
            KendoUtils.setKendoNumricTextValue("txtPaintRate", sysRepairFactoryInfo.paintRate);
            $accreditedAppraiserId.val(sysRepairFactoryInfo.accreditedAppraiserNameStr);
            $accreditedAppraiserId.data("uid", sysRepairFactoryInfo.accreditedAppraiserIdStr);
            $appraiserCompanyId.val(sysRepairFactoryInfo.appraiserCompanyName);
            $appraiserCompanyId.data("uid", sysRepairFactoryInfo.appraiserCompanyId);

        }
    };

    var bindEvent = function () {
        if(isReadonly){
            $("input").prop("disabled", true);
            $("input").addClass("disabled");
            $("#txtRepairFactoryInfoRemark").prop("disabled", true);
            $("#txtRepairFactoryInfoRemark").addClass("disabled");
            $("#lblRepairFactorySection").find("input").addClass("disabled");
            $("#cboRepairFactoryType").data("kendoDropDownList").enable(false);
            $txtPartnerShip.data("kendoDropDownList").enable(false);
        }else{
            bindEventBtnCoBrands();
            $("#companyId").bind("change", onChangeRemoveError);
            $("#txtRepairFactoryInfoRemark").countRemark("#lblRepairFactoryInfoRemarkCounter");

            $accreditedAppraiserId.prop("disabled", true).addClass("disabled");
            $appraiserCompanyId.prop("disabled", true).addClass("disabled");
            $relateCompany.bind("select", function (e, data) {
                var deferred = new $.Deferred();
                if(data){
                    data.action = deferred.promise();
                    PromptWindow.confirm(MSG_CHANGE_COMPANY, function () {
                        // 清空输入框：派驻定损员、派驻定损员所属机构
                        $accreditedAppraiserId.data("uid", "");
                        $accreditedAppraiserId.val("");
                        $appraiserCompanyId.data("uid", "");
                        $appraiserCompanyId.val("");
                        $('#companyName').text(data.text || "");
                        deferred.resolve(true);
                    }, function () {
                        deferred.resolve(false);
                    });
                }
            });

            $btnSearchAppraiser.bind("click", function () {
                SelectAccAppraiserWindow.open({companyId:kendoRelateCompany.value(),userIds:$accreditedAppraiserId.data("uid")});
            });
            SelectAccAppraiserWindow.bind(SelectAccAppraiserWindow.EVENTS.USER_SAVED, function (e,data) {
                $accreditedAppraiserId.data("uid", data.userIds.join(","));
                $accreditedAppraiserId.val(data.userNames.join(","));
                $appraiserCompanyId.data("uid", data.companyId);
                $appraiserCompanyId.val(data.companyName);
            });

            $txtPartnerShip.closest("span").blur(function () {
                if ($txtPartnerShip.val() != "") {
                    $(this).removeClass("error");
                }
            });

            $("#txtContactInfo").bind("input porpertychange", function(){
                this.value = Utils.getDifiniteValue(this.value, 99);
                $('#contactInfo').text(this.value || "");
            });
            $("#txtRepairFactoryAddress").bind("input porpertychange", function(){
                this.value = Utils.getDifiniteValue(this.value, 99);
                $('#address').text(this.value || "");
            });
            $("#cboRepairFactoryType").bind("change", function(){
                $('#repairFactoryLevelName').text(CodeTable.getCodeTypeById("CD0027",this.value) || "");
            });

            if(!KeyInfo.getRepairFactoryId()){
                $repairFactoryCode.prop("disabled", false).removeClass("disabled");
                $txtRepairFactoryName.prop("disabled", false).removeClass("disabled");
                $repairFactoryCode.val("");
                $txtRepairFactoryName.val("");
                $repairFactoryCode.bind("input porpertychange", function(){
                    $('#repairFactoryCode').text(this.value || "");
                });
                $txtRepairFactoryName.bind("input porpertychange", function(){
                    $('#repairFactoryName').text(this.value || "");
                });
            }
        }
    };

    var bindEventBtnCoBrands = function () {
        $btnCoBrandsForMajor.bind("click", function () {
            SelectRepairCoBrandsWindow.open({vehicleMakeIdStr:$mdVehicleMakeNamesForMajor.data("uid"),vehicleManufMakeNameStr:$mdVehicleMakeNamesForMajor.val()});
        });
        SelectRepairCoBrandsWindow.bind(SelectRepairCoBrandsWindow.EVENTS.USER_SAVED, function (e, data) {
            $mdVehicleMakeNamesForMajor.val(data.vehicleManufMakeNameStr); //承修合作厂牌
            $mdVehicleMakeNamesForMajor.data("uid",data.vehicleMakeIdStr);
            sysRepairFactoryDataModel.vehicleMakeIdStr = data.vehicleMakeIdStr;
            PartDiscountRateInfoView.refreshDiscountType();
            HourDiscountRateInfoView.refreshDiscountType();
        });
    };

    /**
     * 删除校验信息
     */
    var onChangeRemoveError = function () {
        if (!isStringEmpty($(this).val())) {
            if($(this).data("kendoNumericTextBox")){
                $(this).parent('span').parent('span').removeClass("error");
            }else{
                $(this).closest('span').removeClass("error");
            }
        }
    };

    /**
     * 获取修理厂基本信息数据
     */
    var getRepairFactoryBaseInfoData = function () {
        sysRepairFactoryDataModel.repairFactoryCode = $("#txtRepairFactoryCode").val();
        sysRepairFactoryDataModel.repairFactoryName = $("#txtRepairFactoryName").val();
        sysRepairFactoryDataModel.repairFactoryLevel = $("#cboRepairFactoryType").val();
        sysRepairFactoryDataModel.partnerShip = $txtPartnerShip.val();
        sysRepairFactoryDataModel.address = $("#txtRepairFactoryAddress").val();
        sysRepairFactoryDataModel.contactInfo = $("#txtContactInfo").val();
        sysRepairFactoryDataModel.companyId = Number($("#companyId").val());
        sysRepairFactoryDataModel.remark = $("#txtRepairFactoryInfoRemark").val();
        sysRepairFactoryDataModel.electricianMachinistRate = $("#txtMachinistRate").val();
        sysRepairFactoryDataModel.sheetMetalRate = $("#txtSheetMetalRate").val();
        sysRepairFactoryDataModel.paintRate = $("#txtPaintRate").val();
        sysRepairFactoryDataModel.companyId = kendoRelateCompany.value();
        sysRepairFactoryDataModel.accreditedAppraiserIdStr =  $accreditedAppraiserId.data("uid");
        sysRepairFactoryDataModel.appraiserCompanyId = $appraiserCompanyId.data("uid");
        getVehicleMakeIdAndDiscountFlag();
    };

    /**
     * 获取承修和兼修车牌和折扣配置标志
     */
    var getVehicleMakeIdAndDiscountFlag = function(){
        sysRepairFactoryDataModel.vehicleMakeIdStr = $mdVehicleMakeNamesForMajor.data().uid;
        if(sysRepairFactoryDataModel.vehicleMakeIdStr){
            var isRepairDiscountFlag = false;
            $.each(sysRepairFactoryDataModel.sysRfPartDiscounts, function(index,partDisData){
                if(partDisData.partDiscount){
                    sysRepairFactoryDataModel.repairDiscountFlag = FLAG_YES;
                    isRepairDiscountFlag = true;
                    return false;
                }else{
                    sysRepairFactoryDataModel.repairDiscountFlag = FLAG_NO;
                }
            });
            if(!isRepairDiscountFlag){
                $.each(sysRepairFactoryDataModel.sysRfHourDiscounts, function(index,hourDisData){
                    if(hourDisData.hourDiscount){
                        sysRepairFactoryDataModel.repairDiscountFlag = FLAG_YES;
                        return false;
                    }else{
                        sysRepairFactoryDataModel.repairDiscountFlag = FLAG_NO;
                    }
                });
            }
        }else{
            sysRepairFactoryDataModel.repairDiscountFlag = FLAG_NO;
        }
    };

    /**
     * 校验必输项
     */
    var repairFactoryValidator = function () {
        var deferred = new $.Deferred();
        //校验修理厂信息
        var repairFactorySectionValidator = $("#lblRepairFactorySection").find("span.requireIco").parents('td').next().find("input");
        var validMessage = markErrorFields(repairFactorySectionValidator) ? "" : REPAIR_FACTORY_MESSAGE;
        var repetitionMessage = "";
        if(!sysRepairFactoryDataModel.repairFactoryId){
            validRepairFactoryCode($("#txtRepairFactoryCode").val(), $("#txtRepairFactoryName").val(), function (data) {
                if (data.CodeCount > 0 || data.NameCount > 0) {
                    if(data.CodeCount > 0){
                        repetitionMessage += REPAIR_CODE_DUPLICATE;
                    }
                    if (data.NameCount > 0) {
                        repetitionMessage += REPAIR_NAME_DUPLICATE;
                    }
                }
                deferred.resolve({validMessage: validMessage, repetitionMessage: repetitionMessage});
            });
        }else{
            deferred.resolve({validMessage: validMessage, repetitionMessage: repetitionMessage});
        }
        return deferred.promise();
    };


    var validRepairFactoryCode = function (repairFactoryCode, repairFactoryName, callBack) {
        var url = getEstimatingURL("/sysmanagement/admin/repairFactory/validCodeAndNameUnique");
        $.ajax({
            url: url,
            data: {"repairFactoryCode": repairFactoryCode, "repairFactoryName": repairFactoryName, "date": new Date().getTime()},
            type: "post",
            success: function (data) {
                callBack(data);
            },
            error: function (data) {
                PromptWindow.alert(STR_SYS_ERROR);
            }
        });
    };

    function isStringEmpty(s) {
        if(s !== null && !isNaN(s)){
            s = s.toString();
        }
        if (s && s.trim().length > 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 校验必输项
     */
    var markErrorFields = function (FieldsValidator) {
        var isNotNullEmpty = true;
        $.each(FieldsValidator, function () {
            $(this).bind("blur",onChangeRemoveError);
            if (isStringEmpty($(this).val())) {
                if($(this).data("kendoNumericTextBox")){
                    $(this).parent('span').parent('span').addClass('error');
                }else{
                    $(this).closest('span').addClass('error');
                }
                if (isNotNullEmpty) {
                    isNotNullEmpty = false;
                }
            } else {
                if($(this).data("kendoNumericTextBox")){
                    $(this).parent('span').parent('span').removeClass('error');
                }else{
                    $(this).closest('span').removeClass('error');
                }
            }
        });

        return isNotNullEmpty;
    };

    /**
     * 页面初始化
     */
    var init = function () {
        initUI();
        initJQueryObjects();
        bindEvent();
        initPageData();
    };

    return {
        init: init,
        repairFactoryValidator: repairFactoryValidator,
        getRepairFactoryBaseInfoData: getRepairFactoryBaseInfoData
    }
})(jQuery);

(function ($) {
    $(function () {
        RepairFactoryBaseInfoView.init();
        var config = [{element: "#repairFactoryInfoDiv"}];
        kendoHeightCalculation(config);
    });
})(jQuery);