(function (window) {
    /*$('#simplewizardinwidget').wizard({
     currentStep: 2,
     prevBtn: $('.pre'),
     nextBtn: $('.next')
     }).data('wizard').setState();*/

    utils.initStepWidget({
        $dom: $('#simplewizardinwidget'),
        step: 2,
        prevBtn: $('.pre'),
        nextBtn: $('.next')
    });

    $('.pre').click(function () {
        $('#simplewizardinwidget').data('wizard').previous();
    });

    $('.next').click(function () {
        $('#simplewizardinwidget').data('wizard').next();
    });

    $('#simplewizardinwidget').on('click', 'li.complete', function (e) {
        $('#simplewizardinwidget').data('wizard').stepclicked(e);
    });
})(window);