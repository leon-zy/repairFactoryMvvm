(function($) {
    /**
     * 关键信息
     *
     * @author TJ
     */
    var KeyInfo = {};

    KeyInfo.setKeyInfo = function(paramObj) {
        if (!paramObj) {
            return;
        }
        // 修理厂编码
        $('#repairFactoryCode').text(paramObj.repairFactoryCode || "");
        // 修理厂名称
        $('#repairFactoryName').text(paramObj.repairFactoryName || "");
        // 关联机构
        $('#companyName').text(paramObj.companyName || "");
        // 联系方式
        $('#contactInfo').text(paramObj.contactInfo || "");
        // 修理厂类型
        $('#repairFactoryLevelName').text(CodeTable.getCodeTypeById("CD0027",paramObj.repairFactoryLevel) || "");
        // 修理厂地址
        $('#address').text(paramObj.address || "");
    };

    /**
     * 获取系统修理厂主键
     */
    KeyInfo.getRepairFactoryId = function() {
        return $('#repair_Factory_Id').val();
    };

    window.KeyInfo = KeyInfo;
})(jQuery);
