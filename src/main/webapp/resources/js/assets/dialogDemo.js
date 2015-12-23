$("#bootbox-options").on('click', function() {
    utils.showDialog($('#myModal'));
});

$("#bootbox-success").on('click', function() {
    bootbox.dialog({
        message: $("#modal-success").html(),
        title: "Success",
        className: ""
    });
});

$('.btn_tip').click(function() {
    utils.dialog({
        type: 'tip',
        value: 'haha'
    });
});

$('.btn_alert').click(function() {
    utils.dialog({
        type: 'alert',
        title: 'hehe',
        value: 'haha',
        // size: 'md',
        // size: 'sm',
        // closeButton: true,
        confirmFunc: function() {
            alert('confirm');
        }
    });
});

$('.btn_confirm').click(function() {
    utils.dialog({
        type: 'confirm',
        title: 'hehe',
        value: 'haha',
        // size: 'md',
        // size: 'sm',
        // closeButton: true,
        confirmFunc: function() {
            alert('confirm');
        },
        cancelFunc: function() {
            alert('cancel');
        }
    });
});

$('.btn_prompt').click(function() {
    utils.dialog({
        type: 'prompt',
        title: 'hehe',
        value: 'haha',
        placeholder: 'lalalalala',
        // size: 'md',
        // size: 'sm',
        confirmFunc: function() {
            alert('confirm');
        },
        cancelFunc: function() {
            alert('cancel');
        }
    });
});