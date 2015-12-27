/*$('#summernote').summernote({
 height: 300,
 toolbar: [
 ['style', ['style']],
 ['font', ['bold', 'italic', 'underline', 'clear']],
 ['fontname', ['fontname']],
 // ['fontsize', ['fontsize']], Still buggy
 ['color', ['color']],
 ['para', ['ul', 'ol', 'paragraph']],
 ['height', ['height']],
 ['table', ['table']],
 ['insert', ['link', 'ownpicture', 'video']],
 ['view', ['fullscreen', 'codeview']],
 ['help', ['help']]
 ]
 });*/

var summernote = utils.initSummernote($('#summernote'), {
    ownPicPopup: true
});

$('input[type=file]').bind('change', function () {
    summernote.insertImage($('.note-editor'), this.files);
});

$('.hahaha').click(function () {
    summernote.insertImage('../img/test2.png');
});

$('#summernote+.note-editor button[data-event=showPersonalImageDialog]').click(function () {
    alert('添加图片');
});


// ===========================================================================
(function () {
    var totalModelNum = 1,
        curModelIndex,
        defaultHeight = 85,
        bodyRightHeight = $('.tab_body_right').height();
    console.log(bodyRightHeight);

    function binbEvent() {
        $('#myTab a').click(function () {
            $(this).tab('show');
        });

        // 编辑按钮点击事件
        $('.model_list .item.main_model i').click(function () {
            if (this.getAttribute('type') === '0') {
                // 编辑按钮点击事件
                curModelIndex = '0';
                $('.tab_body_right .right_inner').css({
                    'transform': 'translateY(0px)'
                });
                $('.tab_body_right').css('height', bodyRightHeight + 'px');
            }
        });


        $('.add_model_area .build_model_btn').click(function () {
            var addIndex = totalModelNum;
            totalModelNum++; //todo

            curModelIndex = addIndex;

            var item = "<div class='item normal_model clx' index='" + addIndex + "'>" +
                "<span class='text_ellipsis line_ellipsis_2'>师傅，大师兄又被妖怪抓走了！！师傅，大师兄又被妖怪抓走了！！</span>" +
                "<img src='../img/test1.jpg'>" +
                "<div class='item_shadow transition_03'>" +
                "<div class='item_shadow_inner'>" +
                "<i class='fa fa-pencil transition_01' type='0'></i>" +
                "<i class='fa fa-trash transition_01' type='1'></i>" +
                "</div>" +
                "</div>" +
                "</div>";

            var $item = $(item);

            $item.find('i').click(function () {
                var index = $(this).parents('.item').eq(0).attr('index');

                if (curModelIndex === index) return;

                curModelIndex = index;
                var mainModelHeight = $('.tab_body .model_list .item.main_model').outerHeight();
                var normalModelHeight = $(this).parents('.item').eq(0).outerHeight();
                console.log(index + '=======' + mainModelHeight + '=======' + normalModelHeight);
                if (this.getAttribute('type') === '0') {
                    // 编辑按钮点击事件
                    $('.tab_body_right .right_inner').css({
                        'transform': 'translateY(' + (mainModelHeight + normalModelHeight * (index - 0.5) - defaultHeight) + 'px)'
                    });
                    $('.tab_body_right').css('height', (bodyRightHeight + mainModelHeight + normalModelHeight * (addIndex - 0.5) - defaultHeight) + 'px');
                } else {
                    // 删除按钮点击事件
                    // 删除数组元数据
                    totalModelNum--;
                    // 当前index回复到第一个
                    curModelIndex = '0';
                    // 删除当前item
                    $(this).parents('.item').eq(0).remove();
                    // 重新刷新当前model列表的index
                    $('.tab_body .model_list .item').each(function (index, el) {
                        $(el).attr('index', index);
                    });

                    $('.tab_body_right .right_inner').css({
                        'transform': 'translateY(0px)'
                    });
                    $('.tab_body_right').css('height', bodyRightHeight + 'px');
                }
            });

            $('.tab_body .model_list').append($item);
            var mainModelHeight = $('.tab_body .model_list .item.main_model').outerHeight();
            var normalModelHeight = $item.outerHeight();
            $('.tab_body_right .right_inner').css({
                'transform': 'translateY(' + (mainModelHeight + normalModelHeight * (addIndex - 0.5) - defaultHeight) + 'px)'
            });
            $('.tab_body_right').css('height', (bodyRightHeight + mainModelHeight + normalModelHeight * (addIndex - 0.5) - defaultHeight) + 'px');
        });
    }

    binbEvent();
})(window);