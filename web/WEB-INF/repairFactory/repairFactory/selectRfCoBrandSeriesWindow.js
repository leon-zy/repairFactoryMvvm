var SelectRfCoBrandSeriesWindow = (function ($) {
    var NO_DATA_FOUND = stringResourceMap.get("RES_179");//没有找到匹配的结果
    var REPAIR_CO_BRANDS = stringResourceMap.get("RES_33");//合作厂牌
    var REPAIR_CO_BRANDS_SERIES = stringResourceMap.get("RES_172");//合作厂牌车系
    var PLEASE_SELECT = stringResourceMap.get("RES_180");  // 请选择

    var detailWindow;
    var $coBrandSeriesWindow;
    var $btnSave;
    var $btnCancel;
    var $mdVehicleMakeFuzzySearch;
    var $mdVehicleMakeFuzzySearchKey;
    var mdVehicleMakeMap; //按照国别存放厂牌数组
    var mdVehicleMakeAll; //所有的厂牌
    var $btnSaveAllCoBrands;
    var $selectAllVehicleSeries;//选择全部（checkbox）
    var that;
    var USER_SAVED = "";

    var init = function () {
        $btnSave = $("#btnSave_coBrandSeries");
        $btnCancel = $("#btnCancel_coBrandSeries");
        $coBrandSeriesWindow = $("#coBrandSeriesWindow");
        $btnSaveAllCoBrands = $("#btnSave_allCoBrands");
        $selectAllVehicleSeries = $("#selectAllVehicleSeries");
        $mdVehicleMakeFuzzySearch = $("#mdVehicleMakeFuzzySearch");
        $mdVehicleMakeFuzzySearchKey = $("#mdVehicleMakeFuzzySearchKey");
        detailWindow = $coBrandSeriesWindow.kendoWindow({
            pinned: true,
            title: REPAIR_CO_BRANDS + REPAIR_CO_BRANDS_SERIES,
            animation: false,
            modal: true, // 是否模态显示，
            draggable: false, // 是否可移动
            visible: false, // 初次是否可见
            resizable: false,
            width: 800
        }).data("kendoWindow");
        initCountryList();
        initMdVehicleMakeAll();  //初始化所有厂牌列表
        bindEvents();
    };

    //事件绑定
    var bindEvents = function () {
        //国别点击
        $("#selectCountrySeriesList li").bind("click", function () {
            countryListClick($(this));
        });
        $selectAllVehicleSeries.bind("click", triggerSelectAll);
        //合作厂牌弹出窗的确定和取消按钮
        $btnSave.bind("click", function () {
            saveCoBrands();
        });
        $btnCancel.bind("click", function () {
            detailWindow.close();
        });
        $btnSaveAllCoBrands.bind("click", saveAllCoBrands);
        $mdVehicleMakeFuzzySearch.bind("click", mdVehicleMakeFuzzySearchByName);
    };

    //初始化所有厂牌列表
    function initMdVehicleMakeAll() {
        if (!mdVehicleMakeAll) {
            mdVehicleMakeMap = new Map();
            $.ajax({
                url: getEstimatingURL("/metadata/findMdVehicleMakeList"),
                contentType: "application/json",
                type: "POST"
            }).done(function (list) {
                if (list) { //如果返回厂牌列表不为空
                    mdVehicleMakeAll = list;
                    $.each(list, function (index, obj) {
                        var countryId = obj.countryId;
                        var arr = mdVehicleMakeMap.get(countryId);
                        if (!arr) {
                            arr = [];
                        }
                        arr.push(obj);
                        mdVehicleMakeMap.put(countryId, arr);
                    });
                    fillCountryTemplate(mdVehicleMakeAll); //填充右边厂牌模板,默认选择全部国别
                } else {
                    $("#mdVehicleMakeSeriesId").html(NO_DATA_FOUND);
                }
            });
        }
    }

    //全选按钮操作
    var triggerSelectAll = function () {
        var selectAllFlag = this.checked;
        $.each($(".vehicleSeriesCheck"), function (index, obj) {
            var inputCheck = $(obj);
            inputCheck.get(0).checked = selectAllFlag;
        });
    };

    //左边国别列表点击事件
    function countryListClick(li) {
        $("#selectCountrySeriesList li").removeClass("selected");
        li.addClass("selected");
        mdVehicleMakeFuzzySearchByName();
    }

    //左边国别列表点击事件
    function mdVehicleMakeListClick(li) {
        $("#MdVehicleMakeSeriesList li").removeClass("selected");
        li.addClass("selected");
        mdVehicleSeriesFuzzySearchByName();
    }

    //填充中间厂牌模板
    function fillCountryTemplate(countryList) {
        if(countryList && countryList.length){
            var template = kendo.template($("#MdVehicleMakeSeriesTemplate").html());
            var result = template(countryList);
            $("#mdVehicleMakeSeriesId").html(result);
            //厂牌点击
            $("#MdVehicleMakeSeriesList li").bind("click", function () {
                mdVehicleMakeListClick($(this));
            });
        }else{
            $("#mdVehicleMakeSeriesId").html(NO_DATA_FOUND);
        }
        mdVehicleSeriesFuzzySearchByName();
    }

    //填充右边车系模板
    function fillVehicleSeriesTemplate(vehicleMakeList) {
        if(vehicleMakeList && vehicleMakeList.caseCodeData && vehicleMakeList.caseCodeData.length){
            var template = kendo.template($("#MdVehicleSeriesTemplate").html());
            var result = template(vehicleMakeList.caseCodeData);
            $("#MdVehicleSeriesList").html(result);
            $(".vehicleSeriesCheck").bind("click", changeSelectAllCheck);
        }else{
            $("#MdVehicleSeriesList").html(NO_DATA_FOUND);
        }
    }

    var changeSelectAllCheck = function(){
        if(!this.checked){
            $selectAllVehicleSeries.prop("checked", false);
        }else{
            var $vehicleSeriesCheck = $(".vehicleSeriesCheck");
            var isSelectAllChecked = true;
            $($vehicleSeriesCheck).each(function(index, obj){
                if(!obj.checked){
                    isSelectAllChecked = false;
                    $selectAllVehicleSeries.prop("checked", false);
                    return false;
                }
            });
            if(isSelectAllChecked){
                $selectAllVehicleSeries.prop("checked", true);
            }
        }
    };

    //根据名称查询厂牌
    var mdVehicleMakeFuzzySearchByName = function(){
        var mdVehicleMakeFuzzySearchKey = $mdVehicleMakeFuzzySearchKey.val();
        var countryId = $("#selectCountrySeriesList").find(".selected").attr("id");
        var countryList = [];
        var countryListData = [];
        if (countryId) {
            countryList = mdVehicleMakeMap.get(countryId.toString());
        } else {
            countryList = mdVehicleMakeAll;
        }
        if(mdVehicleMakeFuzzySearchKey){
            $(countryList).each(function(index, obj){
                if(obj.vehicleManufMakeName.toLowerCase().indexOf(mdVehicleMakeFuzzySearchKey.toLowerCase()) >= 0){
                    countryListData.push(obj);
                }
            });
        }else{
            countryListData = countryList;
        }
        fillCountryTemplate(countryListData);
    };

    //根据名称查询车系
    var mdVehicleSeriesFuzzySearchByName = function(){
        $selectAllVehicleSeries.prop("checked", false);
        var vehicleMakeId = $("#MdVehicleMakeSeriesList").find(".selected").attr("id");
        var params = {
            "cascadeDataQueryId": "metadata.getVehicleSeries",
            "vehicleMakeId": vehicleMakeId
        };
        var url = getEstimatingURL("/metadata/loadCascadeData");
        var vehicleMakeList = Utils.loadAjaxData(params, url);
        fillVehicleSeriesTemplate(vehicleMakeList);
    };

    //保存合作厂牌
    var saveAllCoBrands = function () {
        var $vehicleMakeSelected = $("#MdVehicleMakeSeriesList").find(".selected");
        if($vehicleMakeSelected && $vehicleMakeSelected.length){
            var vehicleSeriesData = {};
            var vehicleSeriesDataList = [];
            var paramData = createNewParam();
            paramData.vehicleMakeId = $vehicleMakeSelected.attr("id");
            paramData.vehicleMakeName = $vehicleMakeSelected.text();
            paramData.vehicleMakePinYin = $vehicleMakeSelected.attr("name");
            paramData.vehicleSeriesId = "";
            paramData.vehicleSeriesName = stringResourceMap.get("RES_898");
            paramData.partTypeName = PLEASE_SELECT;
            paramData.repairFactoryLevelName = PLEASE_SELECT;
            vehicleSeriesDataList.push(paramData);
            vehicleSeriesData.vehicleSeriesDataList = vehicleSeriesDataList;
            that.events.trigger(USER_SAVED, vehicleSeriesData);
            detailWindow.close();
        }else{
            PromptWindow.alert("请选择具体厂牌。");
        }
    };

    //保存合作厂牌
    var saveCoBrands = function () {
        var $vehicleMakeSelected = $("#MdVehicleMakeSeriesList").find(".selected");
        var $vehicleSeriesCheck = $("input.vehicleSeriesCheck:checked");
        if($vehicleSeriesCheck && $vehicleSeriesCheck.length){
            var vehicleSeriesData = {};
            var vehicleSeriesDataList = [];
            $vehicleSeriesCheck.each(function(index, obj){
                var paramData = createNewParam();
                paramData.vehicleMakeId = $vehicleMakeSelected.attr("id");
                paramData.vehicleMakeName = $vehicleMakeSelected.text();
                paramData.vehicleMakePinYin = $vehicleMakeSelected.attr("name");
                paramData.partTypeName = PLEASE_SELECT;
                paramData.repairFactoryLevelName = PLEASE_SELECT;
                paramData.vehicleSeriesId = obj.id;
                paramData.vehicleSeriesName = $(obj).parent().parent().next().find("label").text();
                vehicleSeriesDataList.push(paramData);
            });
            vehicleSeriesData.vehicleSeriesDataList = vehicleSeriesDataList;
            that.events.trigger(USER_SAVED, vehicleSeriesData);
            detailWindow.close();
        }else{
            PromptWindow.alert("请选择具体车系。");
        }
    };

    //根据模板生成左边国别列表
    var initCountryList = function () {
        var template = kendo.template($("#seriesCountryTypeTemplate").html());
        var result = template(CodeTable.getCodesByType("CD0001"));
        $("#seriesCountryTypeTd").html(result);
    };

    var createNewParam = function () {
        return {
            validFlag: "1",
            vehicleMakePinYin: "",
            vehicleMakeId: null,
            vehicleMakeName: null,
            vehicleSeriesId: null,
            vehicleSeriesName: null
        };
    };

    return {
        events: $({}), //事件对象
        EVENTS: {
            // 数据加载完毕
            PART_SAVED: "partDisRateVehicleInfoDetail",
            HOUR_SAVED: "hourDisRateVehicleInfoDetail"
        }, //事件常量
        //绑定事件
        bind: function () {
            this.events.on.apply(this.events, arguments);
        },
        initialize: function () {
            that = this;
            init();
        },
        open: function (userSaved) {
            USER_SAVED = userSaved;
            $mdVehicleMakeFuzzySearchKey.val("");
            countryListClick($("#selectCountrySeriesList li:eq(0)"));//初始化国别为“全部”,每次打开一个修理厂，填充右边厂牌模板,默认选择全部国别
            mdVehicleSeriesFuzzySearchByName();//每次打开都要重置checkBox
            detailWindow.center().open();
            $("#selectCountrySeriesList").parent("div").scrollTop(0);
            $("#MdVehicleMakeSeriesList").parent("div").scrollTop(0);
            $("#MdVehicleSeriesList").scrollTop(0);
        }
    };
})(jQuery);

(function ($) {
    $(function () {
        SelectRfCoBrandSeriesWindow.initialize();
    });
})(jQuery);