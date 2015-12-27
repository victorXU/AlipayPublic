$(document).ready(function(){
	/*  初始化菜单  */
	utils.initBar();
	
	/*  日期控件初始化  */
	utils.initDatePicker($('#createDate'), {
		format: 'YYYY-MM-DD',
		startDate: '2015-08-22',
		endDate: '2015-08-25'
	});
	
	/*  保存  */
	utils.formValidate($('#registrationForm'), function() {
		var jsonParam = utils.convertToJson($("#registrationForm"));
		//alert(JSON.stringify(jsonParam));
		utils.doNet({
			url:'/demo/addDemoAction',
			data:jsonParam
		}).done(function(resp){
			utils.dialog({
				type: 'alert',
				title: '信息提示',
				value: '保存成功！',
				confirmFunc: function() {
					window.location.href = 'list';
				}
			});
		}).fail(function(resp){
			utils.dialog({
				type: 'alert',
				title: '信息提示',
				value: '保存失败！',
				confirmFunc: function() {
					//window.location.href = 'list';
				}
			});
		});
	}, function() {
		//alert('验证失败');
		//验证失败
	});
	
	/*  返回  */
	$(".btn_cancel").click(function(){
		window.location.href = 'list';			
	});
});

