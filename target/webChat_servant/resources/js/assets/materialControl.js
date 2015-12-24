(function () {
    function binbEvent() {
        $('.share_btn_list li').bind('click', function () {
            $('.share_btn_list li').removeClass('focus');
            $(this).addClass('focus');
        });

        $('.sidebar_menuList li').bind('click', function () {
            $('.sidebar_menuList li').removeClass('active');
            $(this).addClass('active');
        });

        $('.group_item').bind('click', function () {
            $('.group_item.active').removeClass('active');
            $(this).addClass('active');
        });

        $('.list_change_bar i').bind('click', function () {
            $('.list_change_bar i').removeClass('active');
            $(this).addClass('active');
            if ($(this).attr('type') === 'small') {
                $('.material_list').addClass('small_model');
            } else {
                $('.material_list').removeClass('small_model');
            }
        });

        $('#myTab a').click(function () {
            $(this).tab('show');
        });

        var totalCount = 100;
        $('#page_ination').pagination({
            dataSource: _.range(totalCount),
            pageSize: 18,
            showGoInput: true,
            showGoButton: true,
            // autoHidePrevious: true,
            // autoHideNext: true,
            formatGoInput: '共<%= totalPage %>页 <%= input %>',
            callback: function (data, pagination) {
                // template method of yourself
                console.log('======分页回调======');
                console.log(data);
                console.log(pagination);
            }
        })
    }

    binbEvent();
})(window);