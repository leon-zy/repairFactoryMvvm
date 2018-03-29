// 工时折扣率TAB页下的 承修厂牌 兼修厂牌 其它 信息操作
var HourDiscountRateInfoView = (function ($) {

    var ALL_DATA_STR = stringResourceMap.get("RES_898"); //全部

    /**
     * 专修（承修）厂牌数据模型
     * @type {{}}
     */
    var MAJOR_MAKE_TYPE_MODEL = {};

    /**
     * 专修（承修）厂牌数据
     */
    var majorMakeTypeHourDisRateData = [];

    var $hourDisRateVehicleInfoDetail = null;

    var createNewParam = function () {
        return {
            checked: false,
            id: null,
            discountType: "",
            discountTypeName: "",
            repairFactoryId: KeyInfo.getRepairFactoryId(),
            discountRate: null,
            validFlag: "1",
            vehicleMakePinYin: "",
            vehicleMakeId: null,
            vehicleMakeName: null,
            vehicleSeriesId: null,
            vehicleSeriesName: null
        };
    };

    var init = function() {
        initPageUI();
        initJQueryObjects();
        bindEvent();
        initPageData();
    };

    var initJQueryObjects = function () {
        $hourDisRateVehicleInfoDetail = $("#hourDisRateVehicleInfoDetail");
    };

    var initPageUI = function () {

    };

    function getWindowHeight(){
        var winHeight = $(window).height() - 306;
        var winHeightStr = winHeight + "px";
        var $disRateVehicleDataGrid = $("div[name='hourDisRateVehicleDataGrid']");
        var $disRateVehicleDataGridTitle = $("#hourDisRateVehicleDataGridTitle");
        if(winHeight < 0){
            winHeightStr = "34px";
        }
        if($disRateVehicleDataGrid.height() > 0){
            $disRateVehicleDataGridTitle.removeClass("grayBorderBottom");
        }else{
            $disRateVehicleDataGridTitle.addClass("grayBorderBottom");
        }
        $disRateVehicleDataGrid.css("max-height",winHeightStr);
    }

    var bindEvent = function () {
        SelectRfCoBrandSeriesWindow.bind(SelectRfCoBrandSeriesWindow.EVENTS.HOUR_SAVED, function (e, data) {
            MAJOR_MAKE_TYPE_MODEL.pushData(data.vehicleSeriesDataList);
        });
    };

    var initPageData = function () {
        sysRepairFactoryDataModel.get().done(function() {
            majorMakeTypeHourDisRateData = [];

            for (var i = 0; i < sysRepairFactoryDataModel.sysRfHourDiscounts.length; i++) {
                var hourDisRateData = sysRepairFactoryDataModel.sysRfHourDiscounts[i];
                if (!hourDisRateData.vehicleMakeName || hourDisRateData.vehicleMakeName == "") {
                    hourDisRateData.vehicleMakeName = ALL_DATA_STR;
                }
                if (!hourDisRateData.vehicleSeriesName || hourDisRateData.vehicleSeriesName == "") {
                    hourDisRateData.vehicleSeriesName = ALL_DATA_STR;
                }
                majorMakeTypeHourDisRateData.push(hourDisRateData);
            }
            // 专修厂牌数据
            MAJOR_MAKE_TYPE_MODEL = RepairFactoryInfoView.getViewModel(majorMakeTypeHourDisRateData, createNewParam());
            MAJOR_MAKE_TYPE_MODEL.sortData();

            kendo.bind($hourDisRateVehicleInfoDetail, MAJOR_MAKE_TYPE_MODEL);
            getWindowHeight();
        });
    };

    var checkHourDisRateData = function(){
        var hasNullDisRateData = false;
        if(MAJOR_MAKE_TYPE_MODEL && Object.keys(MAJOR_MAKE_TYPE_MODEL).length) {
            var hourDisRateData = MAJOR_MAKE_TYPE_MODEL.get(RepairFactoryInfoView.MODEL_DATA_SOURCE);
            _.find(hourDisRateData, function (obj) {
                var nullDisRateData = $hourDisRateVehicleInfoDetail.find("#hourDisRate_" + obj.uid);
                if (!obj.discountRate) {
                    hasNullDisRateData = true;
                    var $hourDiscount = nullDisRateData.find("span[name='hourDiscount']");
                    $hourDiscount.addClass("error");
                    $hourDiscount.find("input").bind("keyup", function () {
                        if (this.value && Number(this.value)) {
                            $hourDiscount.removeClass("error");
                        }
                    });
                }
            });
        }
        return hasNullDisRateData;
    };

    var saveUpdateHourDisRateData = function () {
        sysRepairFactoryDataModel.sysRfHourDiscounts = getHourDisRateData();
    };

    /**
     * 获取工时折扣数据
     * @returns {Array}
     */
    var getHourDisRateData = function() {
        majorMakeTypeHourDisRateData = MAJOR_MAKE_TYPE_MODEL.get(RepairFactoryInfoView.MODEL_DATA_SOURCE).toJSON();
        majorMakeTypeHourDisRateData = $.grep(majorMakeTypeHourDisRateData, function(obj, i){
            return obj.vehicleSeriesName && obj.vehicleSeriesName != "";
        });
        return majorMakeTypeHourDisRateData;
    };

    /**
     * 根据厂牌ID获取工时折扣数据
     * @param vehicleMakeId 厂牌ID
     * @param vehicleSeriesNameCanBeNull 根据标记Flag过滤车系名称为空的数据
     * @returns {Array}
     */
    var getHourDisRateDataByVehicleMakeId = function(vehicleMakeId, vehicleSeriesNameCanBeNull) {
        var disRateData = getHourDisRateData(vehicleSeriesNameCanBeNull);
        disRateData = $.grep(disRateData, function(obj, i){
            if (obj.vehicleMakeId == vehicleMakeId) {
                return true;
            }
        });
        return disRateData;
    };

    /**
     * 根据厂牌ID删除工时折扣数据
     * @param vehicleMakeId 厂牌ID
     * @param discountType 专修/兼修
     */
    var deleteHourDisRateDataByVehicleMakeId = function(vehicleMakeId, discountType) {
        var disRateData = [];
        if (RF_MAKE_TYPE.MAJOR_FLAG == discountType) {
            disRateData = MAJOR_MAKE_TYPE_MODEL.get(RepairFactoryInfoView.MODEL_DATA_SOURCE);
        }
        if(disRateData.length){
            for (var i = disRateData.length - 1; i >= 0; i--) {
                if (disRateData[i].vehicleMakeId == vehicleMakeId) {
                    disRateData.remove(disRateData[i]);
                }
            }
        }
    };

    var refreshDiscountType = function(){
        MAJOR_MAKE_TYPE_MODEL.refreshDiscountType();
    };

    return {
        /**
         * 初始化
         */
        initialize: function () {
            init();
        },
        initPageData : initPageData,
        saveUpdateHourDisRateData : saveUpdateHourDisRateData,
        getHourDisRateData : getHourDisRateData,
        checkHourDisRateData: checkHourDisRateData,
        getHourDisRateDataByVehicleMakeId : getHourDisRateDataByVehicleMakeId,
        deleteHourDisRateDataByVehicleMakeId : deleteHourDisRateDataByVehicleMakeId,
        refreshDiscountType: refreshDiscountType,
        getWindowHeight : getWindowHeight
    }
})(jQuery);

(function ($) {
    $(function () {
        HourDiscountRateInfoView.initialize();
        //刷新数据
        $.subscribe(REPAIR_FACTORY_RELOAD_DATA, function (e, data) {
            HourDiscountRateInfoView.initPageData();
        });
    });
})(jQuery);
