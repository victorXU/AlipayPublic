(function (window, $) {
    var config = {
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
        viewList: []
    };

    var windowWidth = _windowWidth = $(window).width();

    /**
     * options
     * options.typeList    dashboard类型列表
     * options.$viewList    预览视图列表区域
     * options.$typeList    类型列表区域
     */

    function dashBoardDrag(options) {
        return new dashBoardDrag.fn.init(options);
    }

    dashBoardDrag.fn = dashBoardDrag.prototype = {
        init: function (options) {
            this.options = $.extend({}, config, options);
            this.typeList = this.options.typeList;
            this.$typeList = this.options.$typeList;
            this.viewList = this.options.viewList;
            this.$viewList = this.options.$viewList;

            // 创建类型列表构建器
            this.typeListBuilder = new typeListBuilder({
                typeList: this.typeList,
                $typeList: this.$typeList,
                viewList: this.viewList
            });
            // 渲染类型列表
            this.typeListBuilder.render();

            // 根据viewList判断类型列表是否可以再点击

            // 创建viewListBuilder预览区域类
            this.viewListBuilder = new viewListBuilder({
                viewList: this.viewList,
                $viewList: this.$viewList
            });

            // 渲染预览区域列表
            this.viewListBuilder.render();

            // 绑定相关事件
            this.bindEvent();
        },

        bindEvent: function () {
            var self = this;

            // 添加添加dashboard的dashAppend监听事件
            $(window).on('dashAppend', function (e, arg1) {
                console.log('=====触发添加dashBoard事件=====');
                console.log(arg1);
                self.viewListBuilder.addViewItem(arg1);
            });

            // 删除dashboard后，右侧的类型列表hasAppended状态还原成'0'的 typeStatusNormal 事件监听
            $(window).on('typeStatusNormal', function (e, arg) {
                for (var i = 0; i < self.typeListBuilder.typeItemObjList.length; i++) {
                    var typeItemObj = self.typeListBuilder.typeItemObjList[i];
                    if (typeItemObj.typeObj.type === arg) {
                        typeItemObj.$element.attr('hasAppended', '0');
                    }
                }
            });


            // 添加window的宽度变化事件（窗口变化、出现滚动条）

            function windowSizeChangeListener() {
                setInterval(function () {
                    var _windowWidth = $(window).width();
                    if (_windowWidth === windowWidth) {
                        return;
                    } else {
                        self.viewListBuilder.refreshByWindowSizeChange();
                    }
                }, 50);
            }

            windowSizeChangeListener();
        }
    };

    /**
     *============================类型列表生成器*============================
     *dashBoardDrag
     *options
     *options.typeList
     *options.$typeList
     */

    function typeListBuilder(options) {
        this.typeList = options.typeList;
        this.$typeList = options.$typeList;
        this.viewList = options.viewList;
        this.typeItemObjList = [];
    }

    typeListBuilder.prototype = {
        render: function () {
            for (var i = 0; i < this.typeList.length; i++) {
                var typeObj = this.typeList[i];
                this.renderItem(typeObj, i);
            }
        },

        renderItem: function (typeObj, index) {
            // 创建type类
            this.typeItemObj = new typeListItemBuilder(typeObj, index);
            // 渲染type列表
            this.typeItemObj.render(this.$typeList);
            // 组件type列表元数据
            this.typeItemObjList.push(this.typeItemObj);
            // 根据viewList判断当前类型是否已经添加过
            this.typeItemObj.checkAppended(this.viewList);
        }
    };

    // ============================类型列表的单行 类============================

    function typeListItemBuilder(obj, index) {
        this.typeObj = obj;
        this.offsetIndex = index;
        this.$element;
    }

    typeListItemBuilder.prototype = {
        // 创建typeitem模板
        createTypeItem: function () {
            var item = '<div class="col-xs-12 type_item" index=' + this.offsetIndex + '>' + this.typeObj.name + '</div>';
            return item;
        },

        // 判断是否添加过该行对应的item
        checkAppended: function (list) {
            for (var i = 0; i < list.length; i++) {
                var viewObj = list[i];
                if (this.typeObj.type === viewObj.type) {
                    // 如果当前行对应的类型已经添加过
                    this.$element.attr('hasAppended', '1');
                    return;
                }
            }
        },

        // 渲染typeItem
        render: function ($parentList) {
            // 创建item
            var itemStr = this.createTypeItem();
            this.$element = $(itemStr);
            // 绑定相关事件
            this.bindEvent();
            // 渲染item
            $parentList.append(this.$element);
        },

        bindEvent: function () {
            this.$element.on('click', $.proxy(function (e) {
                e.stopPropagation();
                console.log('=====您当前点击的是第' + this.offsetIndex + '个=====');
                console.log(this.typeObj);
                if (this.$element.attr('hasAppended') === '1') {
                    // 如果添加过该类型组件
                    window.utils.dialog({
                        type: 'alert',
                        title: '警告',
                        value: '对不起，一种类型的图表只能添加一次哦~'
                    });
                    return;
                } else {
                    // 如果没有添加过该类型组件
                    this.$element.attr('hasAppended', '1');
                    $(window).trigger('dashAppend', this.typeObj);
                }
            }, this));
        }
    };

    // ============================viewListBuilder dashboard视图域列表 类============================

    function viewListBuilder(options) {
        this.viewList = options.viewList.sort();
        this.$viewList = options.$viewList;
        this.viewItemList = [];
        this.bindEvent();
    }

    viewListBuilder.prototype = {
        // 渲染viewItem
        render: function () {
            for (var i = 0; i < this.viewList.length; i++) {
                var viewObj = this.viewList[i];
                this.addViewItem(viewObj);
            }
        },

        // 添加viewItem
        addViewItem: function (viewObj) {
            viewObj.index = this.viewItemList.length;
            var viewItemObj = new viewListItemBuilder({
                $viewList: this.$viewList,
                viewObj: viewObj
            });
            viewItemObj.render();
            this.viewItemList.push(viewItemObj);
            console.log('=======' + viewItemObj.viewObj.index + '=======');
        },

        // 刷新viewItem的size
        refreshByWindowSizeChange: function () {
            for (var i = 0; i < this.viewItemList.length; i++) {
                var viewItemObj = this.viewItemList[i];
                viewItemObj.refreshSize();
            }
        },

        // 绑定相关事件
        bindEvent: function () {
            var self = this;
            this.$viewList.on('deleteViewItem', function (e, arg1) {
                console.log('======监听到deleteViewItem事件======');
                // 获取当前项的index
                var index = arg1;
                // 获取视图单个项对象
                var viewItem = self.viewItemList[index];
                console.log('点击的当前视图项对象');
                console.log(viewItem);
                // 移除试图项
                viewItem.remove();
                // 删除元数据中的视图项对象
                self.viewItemList.splice(index, 1);
                // 刷新改视图项后面的视图项的index
                for (var i = index; i < self.viewItemList.length; i++) {
                    var viewItemObj = self.viewItemList[i];
                    // 对删除项后面的项对应的index做自减处理
                    viewItemObj.viewObj.index--;
                    // 刷新显示的序号值
                    viewItemObj.$element.find('.view_item_intro').html(viewItemObj.viewObj.index);
                }
                // 恢复对应类型的可添加性
                var type = viewItem.viewObj.type;
                $(window).trigger('typeStatusNormal', type);
            });
        }
    };

    // ============================viewListItemBuilder 视图列表的单条数据 类============================

    function viewListItemBuilder(options) {
        this.$viewList = options.$viewList;
        this.viewObj = options.viewObj;
        this.perWidth = (this.$viewList.width() / 4) - 1;
        this.width = this.viewObj.type[0] * this.perWidth;
        this.height = this.viewObj.type[1] * this.perWidth;
    }

    viewListItemBuilder.prototype = {
        render: function () {
            var item = this.createViewItem();
            this.$element = $(item);
            this.bindEvent();
            this.$element.css({
                'width': this.width + 'px',
                'height': this.height + 'px',
                // 'background-color': this.getRandomBgColor()
            });
            this.$viewList.append(this.$element);
        },

        getRandomBgColor: function () {
            var colorArray = ['#4B5EED', '#2F9EC8', '#B73408', '#8843BC', '#8C081C'];
            var randomIndex = (Math.random() * 4).toFixed(0);
            var color = colorArray[randomIndex];
            return color;
        },

        refreshSize: function () {
            this.perWidth = (this.$viewList.width() / 4) - 1;
            this.width = this.viewObj.type[0] * this.perWidth;
            this.height = this.viewObj.type[1] * this.perWidth;
            this.$element.css({
                width: this.width + 'px',
                height: this.height + 'px'
            });
        },

        createViewItem: function () {
            var item = '<div class="view_item hover_style_1" index="' + this.index + '">' +
                '<div class="view_item_inner">' +
                '<p class="view_item_index">' + (this.viewObj.index) + '</p>' +
                '<span class="left_vertical_middle"></span>' +
                '<div class="right_vertical_middle">' +
                '<p class="view_item_name">' + this.viewObj.name + '</p>' +
                '<p class="view_item_intro"></p>' +
                '</div>' +
                '<i class="fa fa-trash hover_style_2 btn_delete"></i>' +
                '</div>' +
                '</div>';
            return item;
        },

        remove: function () {
            this.$element.remove();
        },

        bindEvent: function () {
            var self = this;
            this.$element.on('click', '.btn_delete', (function (viewItem) {
                return function () {
                    console.log('======触发deleteViewItem事件======');
                    self.$viewList.trigger('deleteViewItem', viewItem.viewObj.index);
                }
            })(self));
        }
    };

    dashBoardDrag.fn.init.prototype = dashBoardDrag.fn;

    window.dashBoardBuilder = dashBoardDrag;
})(window, window.$);