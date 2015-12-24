(function (window, undefined) {
    // 模拟数据源
    var menuList = [];

    var customMenuArr = [], // 与操作同步修改的元数据
    // 一级菜单dom
        firstMenuStr = '<tr class="first_menu">' +
            '<td>' +
            '<input type="text" class="form-control" placeholder="顺序">' +
            '</td>' +
            '<td>' +
            '<div class="col-xs-10 no-padding">' +
            '<input type="text" class="form-control" placeholder="菜单名称">' +
            '</div>' +
            '<div class=" text-align-right">' +
            '<div class="col-xs-2 no-padding">' +
            '<button class="btn btn_default_color btn_add_second_menu"><i class="fa fa-plus no-margin"></i></button>' +
            '</div>' +
            '</div>' +
            '</td>' +
            '<td>' +
            '<select class="form-control" name="country" data-bv-field="country">' +
            '<option value="">图文消息</option>' +
            '<option value="FR">跳转链接</option>' +
            '</select>' +
            '</td>' +
            '<td>' +
            '<button class="btn btn_default_color" data-toggle="modal" data-target=".bs-example-modal-lg">请选择图文消息</button>' +
            '</td>' +
            '<td>' +
            '<label>' +
            '<input type="checkbox" checked="checked">' +
            '<span class="text"></span> </label>' +
            '</td>' +
            '<td>' +
            '<button class="btn btn_default_color btn_menu_del">删除</button>' +
            '</td>' +
            '</tr>',
    // 二级菜单dom
        secondMenuStr = '<tr class="second_menu">' +
            '<td>' +
            '<div class="col-xs-3 custom-menu no-padding-right">' +
            '<div style="right: 0;"></div>' +
            '</div>' +
            '<div class="col-xs-9 no-padding-right">' +
            '<input type="text" class="form-control" placeholder="顺序">' +
            '</div>' +
            '</td>' +
            '<td>' +
            '<div class="col-xs-2 custom-menu">' +
            '<div></div>' +
            '</div>' +
            '<div class="col-xs-10 no-padding">' +
            '<input type="text" class="form-control" placeholder="菜单名称">' +
            '</div>' +
            '</td>' +
            '<td>' +
            '<select class="form-control" name="country" data-bv-field="country">' +
            '<option value="">图文消息</option>' +
            '<option value="FR">跳转链接</option>' +
            '</select>' +
            '</td>' +
            '<td>' +
            '<button class="btn btn_default_color">请选择图文消息</button>' +
            '</td>' +
            '<td>' +
            '<label>' +
            '<input type="checkbox" checked="checked">' +
            '<span class="text"></span> </label>' +
            '</td>' +
            '<td>' +
            '<button class="btn btn_default_color btn_menu_del">删除</button>' +
            '</td>' +
            '</tr>';

    function initMenuList() {
        // 如果菜单列表的长度为0
        if (menuList.length === 0) {
            // 添加一级菜单
            addFirstMenu();
            return;
        }
        for (var i = 0; i < menuList.length; i++) {
            // todo
            // 添加一级菜单……
            // 添加二级菜单……
        }
    }

    /*初始化事件绑定*/

    function bindEvent() {
        // 添加主菜单按钮点击事件
        $('.btn_add_first_menu').click(addFirstMenu);
        // 添加二级菜单按钮点击事件
        $('#custom_menu_edit_table').on('click', 'tr.first_menu .btn_add_second_menu', addSecondMenu);
        // 删除一级菜单按钮点击事件
        $('#custom_menu_edit_table').on('click', 'tr.first_menu .btn_menu_del', deleteFirstMenu);
        // 删除二级菜单按钮点击事件
        $('#custom_menu_edit_table').on('click', 'tr.second_menu .btn_menu_del', deleteSecondMenu);
    }

    /*添加一级菜单*/

    function addFirstMenu() {
        if ($('#custom_menu_edit_table tr.first_menu').length >= 3) {
            utils.dialog({
                type: 'tip',
                value: '一级菜单最多只能添加3个哟 ~^o^~'
            });
            return;
        }
        // 构建主菜单dom
        var $firstMenu = $(firstMenuStr);
        // 为每一个一级菜单，添加冠以index_的class，以便定位，然后做dom处理
        var index = $('#custom_menu_edit_table tr.first_menu').length;
        $firstMenu.addClass('index_' + index).attr('firstIndex', index);
        // 往dom中添加主菜单
        $('#custom_menu_edit_table tbody').append($firstMenu);
    }

    /*添加二级菜单*/

    function addSecondMenu() {
        // 获取当前主菜单的index
        var index = $(this).parents('.first_menu').eq(0).attr('firstIndex');
        if ($('#custom_menu_edit_table').find('.index_' + index + '.second_menu').length >= 5) {
            utils.dialog({
                type: 'tip',
                value: '二级菜单最多只能添加5个哟 ~^o^~'
            });
            return;
        }
        // 构建二级菜单
        var $secondMenu = $(secondMenuStr);
        // 为每一个二级菜单添加index，以便定位、做dom处理
        var _index = $('#custom_menu_edit_table').find('.index_' + index + '.second_menu').length;
        $secondMenu.addClass('index_' + index).attr('firstIndex', index).attr('secondIndex', _index);
        // 往dom中添加主菜单
        $('#custom_menu_edit_table .index_' + index + ':last').after($secondMenu);
    }

    /*删除一级菜单*/

    function deleteFirstMenu() {
        var index = $(this).parents('tr').eq(0).attr('firstIndex');
        var firstClassName = 'index_' + index;
        var maxIndex = $('#custom_menu_edit_table .first_menu').length - 1;
        // 如果只有一个一级菜单，则提示不能删除
        if (parseInt(maxIndex, 10) === 0) {
            utils.dialog({
                type: 'tip',
                value: '只剩最后一个一级菜单啦~ 不能再删了哦 T_T'
            });
            return;
        }
        // 移除所有该一级菜单域的菜单
        $('#custom_menu_edit_table .' + firstClassName).remove();
        // 如果当前一级菜单并不是最后一个一级菜单
        if (index < maxIndex) {
            for (var i = parseInt(index, 10); i < maxIndex; i++) {
                var oldClass = 'index_' + (i + 1);
                var newClass = 'index_' + i;
                // 修改一级菜单的firstIndex
                $('#custom_menu_edit_table').find('.first_menu.' + oldClass).attr('firstIndex', i);
                // 修改前缀为 'index_'的Class
                $('#custom_menu_edit_table').find('.' + oldClass).removeClass(oldClass).addClass(newClass);
            }
        }
    }

    /*删除二级菜单*/

    function deleteSecondMenu() {
        var firstIndex = $(this).parents('tr').eq(0).attr('firstIndex');
        var secondIndex = $(this).parents('tr').eq(0).attr('secondIndex');
        var indexClass = 'index_' + firstIndex;
        var maxSecondIndex = $('#custom_menu_edit_table .' + indexClass + '.second_menu').length - 1;
        // 删除该行
        $(this).parents('tr').eq(0).remove();
        // 如果当前二级菜单不是最后的一个二级菜单
        if (secondIndex < maxSecondIndex) {
            for (var i = parseInt(secondIndex, 10); i < maxSecondIndex; i++) {
                // 修改该一级菜单下的二级菜单的secondIndex
                $('#custom_menu_edit_table').find('.' + indexClass + '.second_menu').eq(i).attr('secondIndex', i);
            }
        }
    }

    initMenuList();
    bindEvent();

})(window, undefined);