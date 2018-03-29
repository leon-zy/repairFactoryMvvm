var RepairFactoryListStub = {};
/**
 * 刷新任务列表
 */
RepairFactoryListStub.refresh = function() {
    if (window.opener && window.opener.RepairInfoView) {
        window.opener.RepairInfoView.refresh();
    }
};

// 系统修理厂数据模型
var sysRepairFactoryDataModel = {};
// 用于数据修改比对
var sysRepairFactoryDataModelBackUp = {};

var RepairFactoryInfoView = (function($) {

    var PLEASE_SELECT = stringResourceMap.get("RES_180");  // 请选择
    var SAVE_SUCCESS = stringResourceMap.get("RES_939");//	保存成功。
    var STR_SYS_ERROR = stringResourceMap.get("RES_2046");//	系统异常，请联系管理员。
    var REPAIR_FACTORY_ERROR = stringResourceMap.get("RES_3364");//该修理厂已失效，无法进行折扣配置。
    var ALL_DATA_STR = stringResourceMap.get("RES_898"); //全部
    var IS_REPAIR_TRUE = stringResourceMap.get("RES_438"); //是
    var IS_REPAIR_FALSE = stringResourceMap.get("RES_439"); //否
    var PART_DISCOUNT_RATE = stringResourceMap.get("RES_2296"); //进销差率
    var HOUR_DISCOUNT_RATE = stringResourceMap.get("RES_2680"); //工时折扣率

    /**
     * 数据类型，配件/工时
     * @type {{PART_TYPE: string, LABOR_HOUR_TYPE: string}}
     */
    var DATA_TYPE = {
        PART : '01',
        LABOR_HOUR : '02'
    };

    var MODEL_DATA_SOURCE = "partDisRateData";

    var $saveRepairFactory = null;// 保存按钮
    var $submitRepairFactory = null;// 提交按钮
    var $mdVehicleMakeNamesForMajor = null; //承修合作厂牌显示框

    var createCodeParam = function () {
        return {
            codeId: null,
            value: "",
            text: "",
            codeDesc: "",
            displayOrder: null
        };
    };

    /**
     * 厂牌和车系的map
     * @type {Map}
     */
    var vehicleMakeTypeSeriesMap = new Map();
    /**
     * 系统修理厂主键
     * @type {null}
     */
    var repairFactoryId = null;

    /**
     * 系统修理厂信息页面的第一级TAB
     * @type {null}
     */
    var repairFactoryInfoTabStrip = null;

    /**
     * 配件折扣率信息页面的Tab
     * @type {null}
     */
    var partDiscountRateInfoTabStrip = null;

    /**
     * 工时折扣率信息页面的Tab
     * @type {null}
     */
    var hourDiscountRateInfoTabStrip = null;

    var SysRepairFactoryDataModel = function () {
        // 修理厂ID
        this.repairFactoryId = "";
        this.repairFactoryName = "";
        this.repairFactoryCode = "";
        this.repairFactoryLevel = "";
        this.repairFactoryLevelName = "";
        this.address = "";
        this.contactInfo = "";
        this.remark = "";
        //配件渠道
        this.partType = "";
        this.partyTypeName = "";
        this.companyId = "";
        this.companyName = "";
        this.companyCode = "";
        this.companyDisplayName = "";
        this.validFlag = "";
        this.manageRate = "";
        this.manageFeeRate = "";
        this.sheetMetalRate = "";
        this.electricianMachinistRate = "";
        this.machinistRate = "";
        this.paintRate = "";
        this.appraiserCompanyId = "";
        this.appraiserCompanyName = "";
        this.accreditedAppraiserIdStr = "";
        // 派驻定损员名字
        this.accreditedAppraiserNameStr = "";
        this.black = "";
        // 合作厂牌id,多选
        this.vehicleMakeIdStr = "";
        // 合作厂牌名字
        this.vehicleManufMakeNameStr = "";
        // 折扣系数
        this.sysRepairDiscountList = [];
        // 修理厂配件折扣率
        this.sysRfPartDiscounts = [];
        // 修理厂工时折扣率
        this.sysRfHourDiscounts = [];
        // 合作关系
        this.partnerShip = "";
        // 是否专属品牌
        this.exclusiveFlag = "";
        ////折扣配置标志(0:无, 1:有)
        this.repairDiscountFlag = "";


        // 是否已经初始化完毕
        this.resolved = false;

        this.get = function () {
            if (!this.deferred) {
                this.deferred = new $.Deferred();
                this.resolved = false;
            }
            return this.deferred.promise();
        };

        this.resolve = function () {
            if (!this.deferred) {
                this.deferred = new $.Deferred();
            }
            this.deferred.resolve(this);
            this.resolved = true;
        };
    };

    /**
     * TabStrip初始化
     * @param {String} tabStripId
     * @return {kendo.ui.TabStrip}
     */
    var initTabStrip = function (tabStripId) {
        return $("#" + tabStripId).kendoTabStrip({
            animation: false
        }).data("kendoTabStrip");
    };

    /**
     * 初始化页面UI
     */
    var initUI = function () {
        hideOrDisplayElements();
        repairFactoryInfoTabStrip = initTabStrip("repairFactoryInfoTabStrip").select(0);
        partDiscountRateInfoTabStrip = initTabStrip("partDiscountRateInfoTabStrip").select(0);
        hourDiscountRateInfoTabStrip = initTabStrip("hourDiscountRateInfoTabStrip").select(0);

        //暂无备注和提交功能，隐藏按钮
        $("#caseReamrkBtn").hide();
        $("#submitRepairFactory").hide();
        $("div[class='topNavInfo']").find(".topNavSeprateLine").hide();
    };

    var initJQueryObjects = function () {
        $saveRepairFactory = $("#saveRepairFactory");
        $submitRepairFactory = $("#submitRepairFactory");
        $mdVehicleMakeNamesForMajor = $("#vehicleMakeNames1");
    };

    /**
     * 获取系统修理厂信息
     * @param repairFactoryId
     */
    var loadSysRepairFactoryInfo = function (repairFactoryId) {
        var deferred = $.ajax({
            url: getEstimatingURL("/sysmanagement/admin/repairFactory/loadRepairFactoryInfo"),
            data: {
                "repairFactoryId": repairFactoryId
            },
            type: "POST",
            async: false
        });
        return deferred.promise();
    };

    /**
     * 初始化页面数据
     */
    var initPageData = function () {
        loadSysRepairFactoryInfo(repairFactoryId).done(function(sysRepairFactory) {
            KeyInfo.setKeyInfo(sysRepairFactory);
            $.extend(sysRepairFactoryDataModel, sysRepairFactory);
            $.extend(sysRepairFactoryDataModelBackUp, sysRepairFactory);
            if(sysRepairFactoryDataModel && !sysRepairFactoryDataModel.repairDiscountFlag){
                sysRepairFactoryDataModel.repairDiscountFlag = FLAG_NO;
            }
            sysRepairFactoryDataModel.resolve();
        });
    };

    var bindEvent = function () {
        $saveRepairFactory.bind("click", function(){
            saveUpdateRepairFactoryData();
        });
        $submitRepairFactory.bind("click", function(){
            saveUpdateRepairFactoryData();
            PromptWindow.alert("提交成功。");
        });
    };

    var saveUpdateRepairFactoryData = function () {
        RepairFactoryBaseInfoView.repairFactoryValidator().done(function (args) {
            var pleaseWrite = "请录入";
            var validMessage = pleaseWrite + args.validMessage;
            RepairFactoryBaseInfoView.getRepairFactoryBaseInfoData();
            var checkPartDisRateData = PartDiscountRateInfoView.checkPartDisRateData();
            var checkHourDisRateData = HourDiscountRateInfoView.checkHourDisRateData();
            if(checkPartDisRateData){
                if(validMessage != pleaseWrite){
                    validMessage += "、";
                }
                validMessage += PART_DISCOUNT_RATE;
            }
            if(checkHourDisRateData){
                if(validMessage != pleaseWrite){
                    validMessage += "、";
                }
                validMessage += HOUR_DISCOUNT_RATE;
            }
            var errorMessage = args.repetitionMessage + (validMessage != pleaseWrite ? (validMessage + "。") : "");
            if(errorMessage){
                PromptWindow.alert(errorMessage);
            }else{
                $.blockUI();
                PartDiscountRateInfoView.saveUpdatePartDisRateData();
                HourDiscountRateInfoView.saveUpdateHourDisRateData();
                if(sysRepairFactoryDataModel.sysRfPartDiscounts.length
                    || sysRepairFactoryDataModel.sysRfHourDiscounts.length){
                    sysRepairFactoryDataModel.repairDiscountFlag = FLAG_YES;
                }else{
                    sysRepairFactoryDataModel.repairDiscountFlag = FLAG_NO;
                }
                $.ajax({
                    url: getEstimatingURL("/sysmanagement/admin/repairFactory/saveOrUpdate"),
                    data: JSON.stringify(sysRepairFactoryDataModel),
                    type: "post",
                    contentType: "application/json",
                    success: function (data) {
                        RepairFactoryListStub.refresh();
                        if(data && typeof data === "object"){
                            PromptWindow.alert(SAVE_SUCCESS, function () {
                                RepairFactoryListStub.refresh();
                                if (!sysRepairFactoryDataModel.repairFactoryId) {
                                    windowLocationReplace(data);
                                }else{
                                    initPageData();
                                }
                            });
                        }else{
                            $(window).unbind("beforeunload");
                            PromptWindow.alert(REPAIR_FACTORY_ERROR,function(){
                                window.close();
                            });
                        }
                    },
                    error: function (data) {
                        PromptWindow.alert(STR_SYS_ERROR);
                    },
                    complete: function () {
                        $.unblockUI();
                    }
                });
            }
        });
    };

    /**
     *
     * 获取承修/兼修厂牌
     *
     * @param discountType RF_MAKE_TYPE
     * @returns {Array}
     */
    var getVehicleMakeArray = function (discountType) {
        var vehicleMakesArray = [];
        var $vehicleMakeId = null;
        if (RF_MAKE_TYPE.MAJOR_FLAG == discountType) {
            $vehicleMakeId = $mdVehicleMakeNamesForMajor;
        }
        if ($vehicleMakeId.val() && $vehicleMakeId.val().trim().length > 0) {
            var vehicleMakeNames = $vehicleMakeId.val().split(",");
            var vehicleMakeIds = $vehicleMakeId.data().uid.split(",");
            for (var i = 0; i < vehicleMakeNames.length; i++) {
                var codeParam = createCodeParam();
                codeParam.codeId = i;
                codeParam.value = vehicleMakeIds[i];
                codeParam.text = vehicleMakeNames[i];
                codeParam.codeDesc = vehicleMakeNames[i];
                codeParam.displayOrder = i;
                vehicleMakesArray.push(codeParam);
            }
        }
        if (vehicleMakesArray.length == 0) {
            vehicleMakesArray.push(createCodeParam());
        }
        return vehicleMakesArray;
    };

    var getVehicleSeriesArray = function (vehicleMakeId, viewModuleData, vehicleSeriesName) {
        var vehicleSeriesArray = [];
        if (vehicleMakeId && vehicleMakeId != "") {
            vehicleSeriesArray = vehicleMakeTypeSeriesMap.get(vehicleMakeId);
            if (!vehicleSeriesArray) {
                vehicleSeriesArray = [];

                var allSeriesCodeParam = createCodeParam();
                allSeriesCodeParam.value = "";
                allSeriesCodeParam.text = "*";
                allSeriesCodeParam.codeDesc = "*";
                allSeriesCodeParam.displayOrder = -1;
                vehicleSeriesArray.push(allSeriesCodeParam);

                var params = {
                    "cascadeDataQueryId": "metadata.getVehicleSeries",
                    "vehicleMakeId": vehicleMakeId
                };
                var url = getEstimatingURL("/metadata/loadCascadeData");
                var data = Utils.loadAjaxData(params, url);
                if (data && data.caseCodeData && data.caseCodeData.length > 0) {
                    for (var i = 0; i < data.caseCodeData.length; i++) {
                        var codeParam = createCodeParam();
                        codeParam.codeId = i;
                        codeParam.value = data.caseCodeData[i].dataValue;
                        codeParam.text = data.caseCodeData[i].dataText;
                        codeParam.codeDesc = data.caseCodeData[i].dataText;
                        codeParam.displayOrder = i;
                        vehicleSeriesArray.push(codeParam);
                    }
                    if (vehicleSeriesArray.length > 0) {
                        vehicleMakeTypeSeriesMap.put(vehicleMakeId, vehicleSeriesArray);
                    }
                }
            }
            vehicleSeriesArray = $.grep(vehicleSeriesArray,function(obj){
                for (var i = 0; i < viewModuleData.length; i++) {
                    if (obj.codeDesc == viewModuleData[i].vehicleSeriesName
                        && vehicleMakeId == viewModuleData[i].vehicleMakeId
                        && obj.codeDesc !== vehicleSeriesName) {
                        return true;
                    }
                }
            }, true);
        }

        if (vehicleSeriesArray.length == 0) {
            vehicleSeriesArray.push(createCodeParam());
        }
        return vehicleSeriesArray;
    };

    /**
     * 隐藏元素
     */
    var hideOrDisplayElements = function () {
        /*$("#manageFeeRateTr").hide();
        $("#manageFeeRateTh").hide();
        $("#manageFeeRateTd").hide();
        $("#repairFactoryRate").hide();
        $("#txtManageFeeRate").prop("disabled", true);
        $("#txtMachinistRate").prop("disabled", true);
        $("#txtElectricianRate").prop("disabled", true);
        $("#txtSheetMetalRate").prop("disabled", true);
        $("#txtPaintRate").prop("disabled", true);

        $("#hourDisRateAdditionalMakeTypeTab").hide();
        $("#hourDisRateAdditionalMakeTypeTab").prop("disabled", true);*/
    };

    /**
     * 页面初始化
     */
    var init = function() {
        sysRepairFactoryDataModel = new SysRepairFactoryDataModel();
        sysRepairFactoryDataModelBackUp = new SysRepairFactoryDataModel();
        repairFactoryId = KeyInfo.getRepairFactoryId();
        initUI();
        initJQueryObjects();
        bindEvent();
        initPageData();
    };


    var getViewModel = function (disRateData, newParam) {
        return kendo.observable({
            partDisRateData: disRateData,
            selectAllFlag: false,
            pushData: function (checkRepairBrandsArray) {
                var existDataArray = this.get(MODEL_DATA_SOURCE);
                var dataArray = $.grep(checkRepairBrandsArray, function (obj) {
                    for (var i = 0; i < existDataArray.length; i++) {
                        existDataArray[i].vehicleSeriesId = existDataArray[i].vehicleSeriesId || "";
                        if (obj.vehicleMakeId === existDataArray[i].vehicleMakeId
                            && obj.vehicleSeriesId == existDataArray[i].vehicleSeriesId) {
                            return true;
                        }
                    }
                }, true);
                if (dataArray && dataArray.length > 0) {
                    for (var i = 0; i < dataArray.length; i++) {
                        if(sysRepairFactoryDataModel.vehicleMakeIdStr
                            && sysRepairFactoryDataModel.vehicleMakeIdStr.indexOf(dataArray[i].vehicleMakeId) >= 0){
                            dataArray[i].discountType = RF_MAKE_TYPE.MAJOR_FLAG;
                            dataArray[i].discountTypeName = IS_REPAIR_TRUE;
                        }else{
                            dataArray[i].discountType = RF_MAKE_TYPE.OTHER_FLAG;
                            dataArray[i].discountTypeName = IS_REPAIR_FALSE;
                        }
                        existDataArray.push(dataArray[i].toJSON ? dataArray[i].toJSON() : dataArray[i]);
                    }
                }
                this.sortData();
            },
            sortData:function(){
                var existDataArray = this.get(MODEL_DATA_SOURCE);
                var dataArray = [];
                $.extend(dataArray, existDataArray);

                var sortCondition = Utils.firstCondition(function (o1, o2) {
                    o1.vehicleMakePinYin = o1.vehicleMakePinYin || "";
                    o2.vehicleMakePinYin = o2.vehicleMakePinYin || "";
                    return o1.vehicleMakePinYin < o2.vehicleMakePinYin ? -1 : (o1.vehicleMakePinYin > o2.vehicleMakePinYin ? 1 : 0);
                }).thenCondition(function (o1, o2) {
                    o1.vehicleSeriesId = o1.vehicleSeriesId || "";
                    o2.vehicleSeriesId = o2.vehicleSeriesId || "";
                    return o1.vehicleSeriesId < o2.vehicleSeriesId ? -1 : (o1.vehicleSeriesId > o2.vehicleSeriesId ? 1 : 0);
                });

                dataArray.sort(sortCondition);

                existDataArray.splice(0,existDataArray.length);
                $(dataArray).each(function(index, obj){
                    existDataArray.push(obj);
                });
                PartDiscountRateInfoView.getWindowHeight();
                HourDiscountRateInfoView.getWindowHeight();
            },
            refreshDiscountType: function(){
                var existDataArray = this.get(MODEL_DATA_SOURCE);
                for (var i = 0; i < existDataArray.length; i++) {
                    if(sysRepairFactoryDataModel.vehicleMakeIdStr
                        && sysRepairFactoryDataModel.vehicleMakeIdStr.indexOf(existDataArray[i].vehicleMakeId) >= 0){
                        existDataArray[i].discountType = RF_MAKE_TYPE.MAJOR_FLAG;
                        existDataArray[i].discountTypeName = IS_REPAIR_TRUE;
                    }else{
                        existDataArray[i].discountType = RF_MAKE_TYPE.OTHER_FLAG;
                        existDataArray[i].discountTypeName = IS_REPAIR_FALSE;
                    }
                }
                this.sortData();
            },
            addParam: function (e) {
                if (newParam) {
                    newParam.uid = e.data.uid;
                }
                this.get(MODEL_DATA_SOURCE).pushData(newParam == null ? {} : newParam);
                PartDiscountRateInfoView.getWindowHeight();
                HourDiscountRateInfoView.getWindowHeight();
            },
            addAllParam: function (e) {
                var existDataArray = this.get(MODEL_DATA_SOURCE);
                var hasAllParam = false;
                $(existDataArray).each(function(index, obj){
                    if(!obj.vehicleMakeId && !obj.vehicleSeriesId){
                        hasAllParam = true;
                        return false;
                    }
                });
                if(hasAllParam){
                    PromptWindow.alert("已存在全部厂牌。");
                }else{
                    var allParam = [];
                    if (newParam) {
                        newParam.uid = e.data.uid;
                    }
                    if(sysRepairFactoryDataModel.vehicleMakeIdStr){
                        newParam.discountType = RF_MAKE_TYPE.MAJOR_FLAG;
                        newParam.discountTypeName = IS_REPAIR_TRUE;
                    }else{
                        newParam.discountType = RF_MAKE_TYPE.OTHER_FLAG;
                        newParam.discountTypeName = IS_REPAIR_FALSE;
                    }
                    newParam.vehicleSeriesName = ALL_DATA_STR;
                    newParam.vehicleMakeName = ALL_DATA_STR;
                    newParam.partTypeName = PLEASE_SELECT;
                    newParam.repairFactoryLevelName = PLEASE_SELECT;
                    allParam.push(newParam);
                    this.pushData(allParam);
                }
            },
            deleteParam: function (e) {
                var that = this;
                var partDisRateData = this.get(MODEL_DATA_SOURCE);
                var hasDeleteItem = false;
                $(partDisRateData).each(function () {
                    if (this.checked) {
                        hasDeleteItem = true;
                        return true;
                    }
                });
                if (!hasDeleteItem) {
                    PromptWindow.alert("请选择要删除的记录。");
                } else {
                    $(partDisRateData).each(function () {
                        if (this.checked) {
                            partDisRateData.remove(this);
                        }
                    });
                    that.set("selectAllFlag", false);
                }
                PartDiscountRateInfoView.getWindowHeight();
                HourDiscountRateInfoView.getWindowHeight();
            },
            selectAll: function (e) {
                var partDisRateData = this.get(MODEL_DATA_SOURCE);
                //chrome版本不同，mvm方法判断checked有问题，使用e.target.checked判断
                if(e.target.checked){
                    this.set("selectAllFlag", true);
                }else{
                    this.set("selectAllFlag", false);
                }
                if (this.get("selectAllFlag")) {
                    $(partDisRateData).each(function () {
                        this.set("checked", true);
                    });
                } else {
                    $(partDisRateData).each(function () {
                        this.set("checked", false);
                    });
                }
            },
            clickSingleSelect: function (e) {
                var selectAll = true;
                //chrome版本不同，mvm方法判断checked有问题，使用e.target.checked判断
                if(e.target.checked){
                    e.data.checked = true;
                }else{
                    e.data.checked = false;
                }
                if (!e.data.checked) {
                    selectAll = false;
                } else {
                    $(this.get(MODEL_DATA_SOURCE)).each(function () {
                        if (!this.checked) {
                            selectAll = false;
                            return false;
                        }
                    });
                }
                this.set("selectAllFlag", selectAll);
            },
            changeData : function(e) {
                var partDisRateData = this.get(MODEL_DATA_SOURCE);
                e.data.editFlag = GRID_ITEM_STATUS.GRID_UPDATE;
            },
            checkVehicleMakeList : function(e){
                SelectRfCoBrandSeriesWindow.open($(e.target.closest("div")).attr("id"));
            },
            showDropDownList : function(e) {
                var partDisRateData = this.get(MODEL_DATA_SOURCE);
                var targetName = $(e.target).attr("name") || $($(e.target).closest("td")).attr("name");
                var dropDownListId = e.data.uid + "-" + targetName;
                //KendoUtils.initDropDownList(vehicleMakeId, "codeDesc", "codeId", PLEASE_SELECT, true, true, CodeTable.getCodesByType("CD0027"));
                var $dropDownListId = $("#" + dropDownListId).data("kendoDropDownList");
                if (!$dropDownListId) {
                    $(e.target).html("");
                    $(e.target).append('<div id="' + dropDownListId + '"/>');
                    //var operationTypeData = CodeTable.getCodesByType("CD0027");

                    $dropDownListId = $('#' + dropDownListId)
                        .kendoDropDownList({
                            optionLabel : PLEASE_SELECT,
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: []
                        }).data("kendoDropDownList");

                    var dropDownListValues = [];
                    if (targetName == "vehicleMakeId") {
                        dropDownListValues = getVehicleMakeArray(e.data.discountType, partDisRateData);
                        $dropDownListId.dataSource.data(dropDownListValues);
                        if (e.data.vehicleMakeId && e.data.vehicleMakeId != "") {
                            $dropDownListId.value(e.data.vehicleMakeId);
                        }
                    } else if (targetName == "vehicleSeriesId") {
                        dropDownListValues = getVehicleSeriesArray(e.data.vehicleMakeId, partDisRateData, e.data.vehicleSeriesName);
                        $dropDownListId.dataSource.data(dropDownListValues);
                        if (e.data.vehicleSeriesId && e.data.vehicleSeriesId != "") {
                            $dropDownListId.value(e.data.vehicleSeriesId);
                        }
                    } else if (targetName == "partType") {
                        dropDownListValues = CodeTable.getCodesByType("CD0025");
                        $dropDownListId.dataSource.data(dropDownListValues);
                        if (e.data.partType && e.data.partType != "") {
                            $dropDownListId.value(e.data.partType);
                        }
                    } else if (targetName == "repairFactoryLevel") {
                        dropDownListValues = CodeTable.getCodesByType("CD0027");
                        $dropDownListId.dataSource.data(dropDownListValues);
                        if (e.data.repairFactoryLevel && e.data.repairFactoryLevel != "") {
                            $dropDownListId.value(e.data.repairFactoryLevel);
                        }
                    }

                    $('#' + dropDownListId).bind("blur",function(){
                        var td = $("#" + dropDownListId).parent().parent();
                        if ($dropDownListId.selectedIndex == 0) {
                            if (targetName == "vehicleMakeId") {
                                td.text(e.data.vehicleMakeName ? e.data.vehicleMakeName : "");
                            } else if (targetName == "vehicleSeriesId") {
                                td.text(e.data.vehicleSeriesName ? e.data.vehicleSeriesName : "");
                            } else if (targetName == "partType") {
                                e.data.partType = $dropDownListId.value();
                                td.text(PLEASE_SELECT);
                            } else if (targetName == "repairFactoryLevel") {
                                e.data.repairFactoryLevel = $dropDownListId.value();
                                td.text(PLEASE_SELECT);
                            }
                        } else {
                            var name = $dropDownListId.dataSource.data()[$dropDownListId.selectedIndex - 1];

                            if (targetName == "vehicleMakeId") {
                                if (e.data.vehicleMakeId != $dropDownListId.value()) {
                                    e.data.vehicleSeriesId = null;
                                    e.data.vehicleSeriesName = null;
                                }
                                e.data.vehicleMakeId = $dropDownListId.value();
                                if (name) {
                                    e.data.vehicleMakeName = name.codeDesc;
                                    td.text(name.codeDesc);
                                }
                            } else if (targetName == "vehicleSeriesId") {
                                e.data.vehicleSeriesId = $dropDownListId.value();
                                if (name) {
                                    e.data.vehicleSeriesName = name.codeDesc;
                                    td.text(name.codeDesc);
                                }
                            } else if (targetName == "partType") {
                                e.data.partType = $dropDownListId.value();
                                if (name) {
                                    e.data.partTypeName = name.codeDesc;
                                    td.text(name.codeDesc);
                                }
                            } else if (targetName == "repairFactoryLevel") {
                                e.data.repairFactoryLevel = $dropDownListId.value();
                                if (name) {
                                    e.data.repairFactoryLevelName = name.codeDesc;
                                    td.text(name.codeDesc);
                                }
                            }
                            if($dropDownListId.value()){
                                $(e.target).removeClass("error");
                            }
                        }
                    });
                    $('#' + dropDownListId).parent().focus().click();
                } else {
                    $("#" + dropDownListId).parent().show();
                }
            }
        });
    };

    /**
     * 比较页面数据是否有修改
     * @returns {boolean}
     */
    var compareDataChange = function () {
        //var nowRuleParamsData = VIEW_MODEL.get("partAliasData").toJSON();
        return  !ObjectUtils.equals(sysRepairFactoryDataModelBackUp, sysRepairFactoryDataModel);
        return false;
    };

    /**
     * 根据厂牌ID判断是否该厂牌绑定了相应的折扣数据
     * @param vehicleMakeIds
     * @param vehicleSeriesNameCanBeNull
     * @returns {boolean}
     */
    var checkDisRateDataByVehicleMakeId = function (vehicleMakeIds, vehicleSeriesNameCanBeNull) {
        var hasBindDisRateData = false;
        $.each(vehicleMakeIds, function(index,vehicleMakeId){
            var partDisRateData = PartDiscountRateInfoView.getPartDisRateDataByVehicleMakeId(vehicleMakeId, vehicleSeriesNameCanBeNull);
            var hourDisRateData = HourDiscountRateInfoView.getHourDisRateDataByVehicleMakeId(vehicleMakeId, vehicleSeriesNameCanBeNull);
            if (partDisRateData && partDisRateData.length > 0
                || hourDisRateData && hourDisRateData.length > 0 ) {
                hasBindDisRateData = true;
                return false;
            }
        });
        return hasBindDisRateData;
    };

    /**
     * 根据厂牌ID删除配件折扣数据
     * @param vehicleMakeId 厂牌ID
     * @param discountType 专修/兼修
     */
    var deleteDisRateDataByVehicleMakeId = function(vehicleMakeIds, discountType) {
        $.each(vehicleMakeIds, function(){
            PartDiscountRateInfoView.deletePartDisRateDataByVehicleMakeId(this, discountType);
            HourDiscountRateInfoView.deleteHourDisRateDataByVehicleMakeId(this, discountType);
        });
    };

    // 关闭插窗口之前
    $(window).bind("beforeunload", function () {
        try {
            Utils.addLeavePageConfirm();
            window.opener.REPAIR_FACTORY_WINDOW.remove(window.name);
        } catch (e) {
        }
    });

    var windowLocationReplace = function (data) {
        $(window).unbind("beforeunload");
        var readonly = "false";
        var url = getEstimatingURL('/sysmanagement/admin/repairFactory/' + Base64.encoder(data.repairFactoryId+"") + '/'+Base64.encoder(readonly) + '.html');
        window.location.replace(url);
    };

    /**
     * 浏览器大小改变事件
     */
    $(window).resize(function() {
        PartDiscountRateInfoView.getWindowHeight();
        HourDiscountRateInfoView.getWindowHeight();
    });

    return {
        init : init,
        getViewModel : getViewModel,
        compareDataChange : compareDataChange,
        MODEL_DATA_SOURCE : MODEL_DATA_SOURCE,
        DATA_TYPE : DATA_TYPE,
        checkDisRateDataByVehicleMakeId : checkDisRateDataByVehicleMakeId,
        deleteDisRateDataByVehicleMakeId : deleteDisRateDataByVehicleMakeId
    }
})(jQuery);

(function ($) {
    $(function () {
        Utils.addLeavePageConfirm();
        RepairFactoryInfoView.init();
        if (window.opener && window.opener.REPAIR_FACTORY_WINDOW) {
                window.opener.REPAIR_FACTORY_WINDOW.put(window.name, window);
        }
    });
})(jQuery);