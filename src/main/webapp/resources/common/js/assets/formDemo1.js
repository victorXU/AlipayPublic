$('#myTab a').click(function () {
    $(this).tab('show');
});


utils.formValidate($('#registrationForm'), function () {
    alert(1);
}, function () {
    alert(2);
});

utils.initRangeDatePicker($('#reservation'), {
    format: 'YYYY/MM/DD',
    startDate: '2015-08-22',
    endDate: '2015-08-25'
});

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate;
}
utils.initDatePicker($('.date-picker'), getNowFormatDate());

utils.initDatePicker($('#singleDatePick'));


// 初始化多选下拉框
var data = [];
for (var i = 0; i < 20; i++) {
    data.push({
        id: 'id' + i,
        name: 'name' + i,
        $selected: i > 10 ? true : false,
        $value: 'sdfjklsjflksjdfklsdjflksdjfl' + i
    });
}

var multiSelector = new multiSelector($('.zf_select')[0], data);
console.log(multiSelector.getSelectDataArr());

// 初始化单时分秒控件
utils.initTimePicker({
    $el: $('#time-picker-1'),
    showSeconds: true,
    value: '10:10:10'
});

laydate({
    elem: '#time-picker-2',
    istime: true,
    format: 'YYYY-MM-DD hh:mm:ss',
    start: '1990-01-01 01:00:00'
});