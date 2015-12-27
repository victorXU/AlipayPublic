$(document).ready(function(){
	//alert(111);
	/*  初始化菜单  */
	utils.initBar();
	/*  初始化列表全选  */
	utils.initTableCheckControl($('.table'));
	
	/*  高级搜索初始化 */
	initMoreSearch();
	//alert(ctx);
	
	/*  翻页 */
	var totalCount = $('#totalCount').val();
	var pageSize = $('#pageSize').val();
	var pageNumber = $('#currentPage').val(); 
	$('#page_ination').pagination({
		dataSource: _.range(totalCount),
		pageSize: pageSize,
		showGoInput: true,
		showGoButton: true,
		pageNumber:pageNumber,
		// autoHidePrevious: true,
		// autoHideNext: true,
		formatGoInput: '共计'+totalCount+'条 <%= input %>',
		callback: function(data, pagination) {
			if($('#currentPage').val()!=pagination.pageNumber){
				var jsonParam = utils.convertToJson($("#searchParam"));
				jsonParam.currentPage = pagination.pageNumber+"";
				window.location.href = 'list?jsonParam='+encodeURI(encodeURI(JSON.stringify(jsonParam)));
			}
		}
	});
	
	/*  新增 */
	$("#addBtn").click(function(){
		window.location.href = 'edit';
	});
	
	$("#deleteAllBtn").click(function(){
		var id = utils.getTableCheckControl($('.table'));
		alert("删除id=="+id);
	});
	
	/*  普通搜索 */
	$("#searchBtn").click(function(){
		var jsonParam = utils.convertToJson($("#searchParam"));
		jsonParam.currentPage = "1";
		jsonParam.searchFlag = "0";
		window.location.href = 'list?jsonParam='+encodeURI(encodeURI(JSON.stringify(jsonParam)));
	});
	
	/*  高级搜索 */
	$("#moreSearchBtn").click(function(){
		var jsonParam = utils.convertToJson($("#searchParam"));
		jsonParam.currentPage = "1";
		jsonParam.searchFlag = "1";
		window.location.href = 'list?jsonParam='+encodeURI(encodeURI(JSON.stringify(jsonParam)));
	});
});

function editDemo(id){
	window.location.href = 'edit?id='+id;
}



/*  高级搜索初始化 */
function initMoreSearch(){
	var searchFlag = $("#searchFlag").val();
	//alert(searchFlag);
	if(searchFlag==0){
		$(".table-toolbar").css('display','none');
		$(".search_more i").removeClass('fa-angle-up');
		$(".search_more i").addClass('fa-angle-down');
	}
	else{
		$(".table-toolbar").css('display','block');
		$(".search_more i").removeClass('fa-angle-down');
		$(".search_more i").addClass('fa-angle-up');
	}
}

/*  列表高级搜索  */
$(".search_more").click(function(){
	if($(".table-toolbar").css('display')!='none'){
		$(".table-toolbar").css('display','none');
		$(".search_more i").removeClass('fa-angle-up');
		$(".search_more i").addClass('fa-angle-down');
	}
	else{
		$(".table-toolbar").css('display','block');
		$(".search_more i").removeClass('fa-angle-down');
		$(".search_more i").addClass('fa-angle-up');
	}
});
/*  列表高级搜索  end */

/*  切换每页显示条数 */
function changePageSize(pageSize){
	var jsonParam = {};
	jsonParam['pageSize'] = pageSize;
	jsonParam['currentPage'] = "1";
	jsonParam['searchFlag'] = "0";
	
	window.location.href = 'list?jsonParam='+encodeURI(encodeURI(JSON.stringify(jsonParam)));
}