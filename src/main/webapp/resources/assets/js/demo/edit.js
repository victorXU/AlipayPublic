$(document).ready(function(){
	/*  初始化菜单  */
	utils.initBar();
	
	/*  日期控件初始化  */
	utils.initRangeDatePicker($('#createDate'), {
		format: 'YYYY-MM-DD',
		startDate: '2015-08-22',
		endDate: '2015-08-25'
	});
	
	/*  保存  */
	utils.formValidate($('#registrationForm'), function() {
		var jsonParam = utils.convertToJson($("#registrationForm"));
		if(jsonParam.id==''){
			jsonParam.id=0;
		}
		jsonParam.memo = $('#summernote').code();
		//alert(JSON.stringify(jsonParam));
		utils.doNet({
			url:'/demo/editAction',
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
	var image_size_fx = {"sizeLimit":100 * 1024};
	//文件上传附件开始
	/*
	 *文件上传
	 *@param 1 ：上传按钮id
	 *@param 2：
	 *@param 3 ：
	 *@param 4 ：是否自动上传
	 *@param 5 ：返回函数
	 *@param 6：附件类型（image:图片文件（*.jpg;*.gif;*.png;），vedio：视频文件（*.jpg;*.gif;*.png;），voice：音频文件（*.jpg;*.gif;*.png）;，word：附件文件（'*.doc;*.docx;*.xls;*.xlsx;'））
	 *@param 7：文件上限大小
	 *@param 8：宽度
	 *@param 9：高度
	 */
	uploadFile('pic-form-file',false,false,true,function(){
		//jsonResult:结果集（success：请求状态；id：返回文件id； 返回文件名称；）
  		if(jsonResult.success){
  			if(jsonResult.id ==''){
  				utils.dialog({
  	    	        type: 'alert',
  	    	        title: '提示',
  	    	        value: '上传图片出错!',
  	    	        confirmFunc: function() {
  	    	        }
  	    	    });
  			}
  			$('#imge').attr('src',fileIP+jsonResult.id);
  		}else{
  			utils.dialog({
	    	        type: 'alert',
	    	        title: '提示',
	    	        value: '上传图片出错!',
	    	        confirmFunc: function() {
	    	        }
	    	    });
  		}
	}, "image", image_size_fx,104,34);
	
	/*  返回  */
	$(".btn_cancel").click(function(){
		window.location.href = 'list';			
	});
	var summernote = utils.initSummernote($('#summernote'), {});
	$('#summernote').code($('#memo').val());
});

