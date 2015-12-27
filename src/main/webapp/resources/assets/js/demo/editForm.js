$(document).ready(function(){
	/*  初始化菜单  */
	utils.initBar();
	
	
	/*  保存  */
	utils.formValidate($('#registrationForm'), function() {
		var form = document.getElementById('registrationForm');
		form.action = ctx+'/demo/editFormAction';
		
		form.submit();
	}, function() {
		//alert('验证失败');
		//验证失败
	});
	
	/*  返回  */
	$(".btn_cancel").click(function(){
		window.location.href = 'list';			
	});
});

function success(msg){
	alert(msg);
}

