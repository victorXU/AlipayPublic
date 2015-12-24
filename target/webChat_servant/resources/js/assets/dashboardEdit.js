// (function(window) {
var dashBoard = window.dashBoardBuilder({
    typeList: [{
        type: '11',
        name: '1 * 1'
    }, {
        type: '21',
        name: '2 * 1'
    }, {
        type: '31',
        name: '3 * 1'
    }, {
        type: '41',
        name: '4 * 1'
    }, {
        type: '12',
        name: '1 * 2'
    }, {
        type: '22',
        name: '2 * 2'
    }, {
        type: '32',
        name: '3 * 2'
    }, {
        type: '42',
        name: '4 * 2'
    }],
    $typeList: $('#dashboard_typeList'),
    viewList: [{
        index: 0,
        type: '11',
        name: '1 * 1'
    }, {
        index: 1,
        type: '21',
        name: '2 * 1'
    }, {
        index: 2,
        type: '31',
        name: '3 * 1'
    }, {
        index: 3,
        type: '41',
        name: '4 * 1'
    }, {
        index: 4,
        type: '12',
        name: '1 * 2'
    }, {
        index: 5,
        type: '22',
        name: '2 * 2'
    }, {
        index: 6,
        type: '32',
        name: '3 * 2'
    }, {
        index: 7,
        type: '42',
        name: '4 * 2'
    }],
    $viewList: $('#dashboard_viewList')
});
// })(window);