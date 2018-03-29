// 配件折扣率TAB页下的 承修厂牌 其它 信息操作
var PartDiscountRateInfoView = (function ($) {

    var ALL_DATA_STR = stringResourceMap.get("RES_898"); //全部

    /**
     * 专修（承修）厂牌数据模型
     * @type {{}}
     */
    var MAJOR_MAKE_TYPE_MODEL = {};

    /**
     * 专修（承修）厂牌数据
     */
    var majorMakeTypePartDisRateData = [];

    var $partDisRateVehicleInfoDetail = null;

    var createNewParam = function () {
        return {
            checked: false,
            id: null,
            discountType: "",
            discountTypeName: "",
            partType: null,
            partTypeName: "",
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
        $partDisRateVehicleInfoDetail = $("#partDisRateVehicleInfoDetail");

    };
    var initPageUI = function () {

    };

    var bindEvent = function () {
        SelectRfCoBrandSeriesWindow.bind(SelectRfCoBrandSeriesWindow.EVENTS.PART_SAVED, function (e, data) {
            MAJOR_MAKE_TYPE_MODEL.pushData(data.vehicleSeriesDataList);
        });
    };

    var initPageData = function () {
        sysRepairFactoryDataModel.get().done(function() {
            majorMakeTypePartDisRateData = [];

            for (var i = 0; i < sysRepairFactoryDataModel.sysRfPartDiscounts.length; i++) {
                var partDisRateData = sysRepairFactoryDataModel.sysRfPartDiscounts[i];
                if (!partDisRateData.vehicleMakeName || partDisRateData.vehicleMakeName == "") {
                    partDisRateData.vehicleMakeName = ALL_DATA_STR;
                }
                if (!partDisRateData.vehicleSeriesName || partDisRateData.vehicleSeriesName == "") {
                    partDisRateData.vehicleSeriesName = ALL_DATA_STR;
                }
                majorMakeTypePartDisRateData.push(partDisRateData);
            }
            // 专修厂牌数据
            MAJOR_MAKE_TYPE_MODEL = RepairFactoryInfoView.getViewModel(majorMakeTypePartDisRateData, createNewParam());
            MAJOR_MAKE_TYPE_MODEL.sortData();

            kendo.bind($partDisRateVehicleInfoDetail, MAJOR_MAKE_TYPE_MODEL);

            getWindowHeight();
        });
    };

    function getWindowHeight(){
        var winHeight = $(window).height() - 306;
        var winHeightStr = winHeight + "px";
        var $disRateVehicleDataGrid = $("div[name='partDisRateVehicleDataGrid']");
        var $disRateVehicleDataGridTitle = $("#partDisRateVehicleDataGridTitle");
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

    var checkPartDisRateData = function(){
        var hasNullDisRateData = false;
        if(MAJOR_MAKE_TYPE_MODEL && Object.keys(MAJOR_MAKE_TYPE_MODEL).length){
            var partDisRateModel = MAJOR_MAKE_TYPE_MODEL.get(RepairFactoryInfoView.MODEL_DATA_SOURCE);
            _.find(partDisRateModel , function(obj){
                var nullDisRateData = $partDisRateVehicleInfoDetail.find("#partDisRate_" + obj.uid);
                if(!obj.partType){
                    hasNullDisRateData = true;
                    nullDisRateData.find("#partType_" + obj.uid).addClass("error");
                }
                if(!obj.discountRate){
                    hasNullDisRateData = true;
                    var $partDiscount = nullDisRateData.find("span[name='partDiscount']");
                    $partDiscount.addClass("error");
                    $partDiscount.find("input").bind("keyup", function(){
                        if(this.value && Number(this.value)){
                            $partDiscount.removeClass("error");
                        }
                    });
                }
            });
        }
        return hasNullDisRateData;
    };

    var saveUpdatePartDisRateData = function () {
        sysRepairFactoryDataModel.sysRfPartDiscounts = getPartDisRateData();
    };

    /**
     * 获取配件折扣数据
     * @returns {Array}
     */
    var getPartDisRateData = function() {
        majorMakeTypePartDisRateData = MAJOR_MAKE_TYPE_MODEL.get(RepairFactoryInfoView.MODEL_DATA_SOURCE).toJSON();
        majorMakeTypePartDisRateData = $.grep(majorMakeTypePartDisRateData, function(obj, i){
            return obj.vehicleSeriesName && obj.vehicleSeriesName != "";
        });
        return majorMakeTypePartDisRateData;
    };

    /**
     * 根据厂牌ID获取配件折扣数据
     * @param vehicleMakeId 厂牌ID
     * @param vehicleSeriesNameCanBeNull 根据标记Flag过滤车系名称为空的数据
     * @returns {Array}
     */
    var getPartDisRateDataByVehicleMakeId = function(vehicleMakeId, vehicleSeriesNameCanBeNull) {
        var disRateData = getPartDisRateData(vehicleSeriesNameCanBeNull);
        disRateData = $.grep(disRateData, function(obj, i){
            if (obj.vehicleMakeId == vehicleMakeId) {
                return true;
            }
        });
        return disRateData;
    };

    /**
     * 根据厂牌ID删除配件折扣数据
     * @param vehicleMakeId 厂牌ID
     * @param discountType 专修/兼修
     */
    var deletePartDisRateDataByVehicleMakeId = function(vehicleMakeId, discountType) {
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
        saveUpdatePartDisRateData : saveUpdatePartDisRateData,
        getPartDisRateData : getPartDisRateData,
        checkPartDisRateData: checkPartDisRateData,
        getPartDisRateDataByVehicleMakeId : getPartDisRateDataByVehicleMakeId,
        deletePartDisRateDataByVehicleMakeId : deletePartDisRateDataByVehicleMakeId,
        refreshDiscountType: refreshDiscountType,
        getWindowHeight: getWindowHeight
    }
})(jQuery);

(function ($) {
    $(function () {
        PartDiscountRateInfoView.initialize();

        //刷新数据
        $.subscribe(REPAIR_FACTORY_RELOAD_DATA, function (e, data) {
            PartDiscountRateInfoView.initPageData();
        });

    });
})(jQuery);
