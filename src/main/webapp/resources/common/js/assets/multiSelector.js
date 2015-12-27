(function (window) {
    // $selected,$index,$value
    var DROP_DOWN_AREA = "<div class='zf_selector_dropDown_area'><div class='zf_select_list'></div></div>";

    function getDomData(dom) {
        var domData = {
            width: dom.offsetWidth,
            height: dom.offsetHeight,
            left: dom.offsetLeft,
            top: dom.offsetTop
        };
        var parentNode = dom.offsetParent;
        while (parentNode) {
            domData.left = domData.left + parentNode.offsetLeft;
            domData.top = domData.top + parentNode.offsetTop;
            parentNode = parentNode.offsetParent;
        }
        return domData;
    }

    function packSelectItem(obj, main) {
        var item = "<div class='select_item'>" +
            "<label><input type='checkbox' index='" + obj.$index + "'" + (obj.$selected ? "checked='checked'" : "") + " data-tabel-control='parent' class='colored-common " + (main ? 'main_checkbox' : '') + "'><span class='text common_color_checkbox'></span></label>" +
            "<span class='select_content'>" + obj.$value + "</span>" +
            "</div>";
        return item;
    }

    function isClass(o) {
        if (o === null) return "Null";
        if (o === undefined) return "Undefined";
        return Object.prototype.toString.call(o).slice(8, -1);
    }

    /**
     *深度克隆
     */

    function deepClone(obj) {
        var result, oClass = isClass(obj);
        //确定result的类型
        if (oClass === "Object") {
            result = {};
        } else if (oClass === "Array") {
            result = [];
        } else {
            return obj;
        }
        for (key in obj) {
            var copy = obj[key];
            if (isClass(copy) == "Object") {
                result[key] = arguments.callee(copy); //递归调用
            } else if (isClass(copy) == "Array") {
                result[key] = arguments.callee(copy);
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    };

    function multiSelector(selectDom, dataArr) {
        this.init(selectDom, dataArr);
    }

    multiSelector.prototype = {
        init: function (selectDom, dataArr) {
            this.selectDom = selectDom;
            !$(this.selectDom).hasClass('zf_select') && $(this.selectDom).addClass('zf_select');
            this.selectDomHeight = this.selectDom.offsetHeight;
            this.selectDomWidth = this.selectDom.offsetWidth;
            // 主数据列表
            this.dataArr = dataArr;
            // 下拉框区域
            this.$selectArea;
            // 下拉框内部项的jquery对象集合
            this.$selectItems;
            // 下拉框选中的元数据列表
            this.selectDataArr = [];

            // 渲染下拉框模块
            this.packDropTemplate();
            // 初始化选中的元数据列表
            this.setSelectDataArr();
            // 渲染视图部分列表
            this.renderSelector({
                type: '0'
            });
            // 对多选框视图部分添加尺寸大小变化监听事件
            this.addSizeChangeListener();
            // 绑定相关事件
            this.bindEvent();
        },

        // 获取选中的列表
        getSelectDataArr: function () {
            return deepClone(this.selectDataArr);
        },

        // 设置选中的列表
        setSelectDataArr: function () {
            for (var i = 0; i < this.dataArr.length; i++) {
                var obj = this.dataArr[i];
                if (obj.$selected) {
                    // 初始化元数据
                    this.selectDataArr.push(deepClone(obj));
                }
            }
        },

        // 显示下拉框
        show: function () {
            this.initDropDownListPosition();
            this.$selectArea.show();
        },

        // 隐藏下拉框
        hide: function () {
            this.$selectArea.hide();
        },

        // 初始化下拉框的显示位置
        initDropDownListPosition: function () {
            // var scrollTop = document.body.scrollTop;
            var domData = getDomData(this.selectDom);
            this.$selectArea.css('height', document.body.scrollHeight + 'px').find('.zf_select_list').css({
                left: domData.left + 'px',
                top: (domData.top + domData.height) + 'px',
                width: domData.width + 'px'
            });
        },

        // 装备下拉框大背景区域
        packSelectArea: function () {
            // 创建大的下拉框的区域
            this.$selectArea = $(DROP_DOWN_AREA).css('display', 'none');
        },

        // 装备下拉框列表项
        packSelectItems: function () {
            var items = '';
            // 在组装前先添加一天全选选项
            var checkAllItem = packSelectItem({
                $index: '-1',
                $selected: this.selectDataArr.length === this.dataArr.length,
                $value: '全选'
            }, true);
            items += checkAllItem;
            // 开始组装选项列表
            for (var i = 0; i < this.dataArr.length; i++) {
                this.dataArr[i].$index = i + '';
                var item = packSelectItem(this.dataArr[i], this.dataArr[i].$value);
                items += item;
            }
            this.$selectItems = $(items);
        },

        // 装备下拉框组件
        packDropTemplate: function () {
            // 组装模板
            this.packSelectArea();
            this.packSelectItems();

            // 将组装好的模板设置位置，拼接，并且添加到页面中
            this.initDropDownListPosition();
            this.$selectArea.find('.zf_select_list').append(this.$selectItems);
            $(document.body).append(this.$selectArea);
        },

        /**
         *渲染视图选中列表
         * options.type 取值为0、1、2、3
         * options.obj
         * options.index
         */

        renderSelector: function (options) {
            if (options.type === '0') {
                // 如果是全部选中,或者是初次初始化
                var items = '';
                for (var i = 0; i < this.selectDataArr.length; i++) {
                    var item = "<p class='select_little_item' index='" + this.selectDataArr[i].$index + "'><span>" + this.selectDataArr[i].$value + "</span><i class='fa fa-close'></i></p>";
                    items += item;
                }
                setTimeout($.proxy(function () {
                    $(this.selectDom).append($(items))
                }, this), 0)
                $(this.selectDom).children().not('.drop_down_arrow').remove();
            } else if (options.type === '1') {
                // 如果全部取消
                $(this.selectDom).children().not('.drop_down_arrow').remove();
            } else if (options.type === '2') {
                // 如果是单个添加
                var item = "<p class='select_little_item' index='" + options.obj.$index + "'><span>" + options.obj.$value + "</span><i class='fa fa-close'></i></p>";
                $(this.selectDom).append($(item));
            } else {
                // 如果是单个删除
                $(this.selectDom).find('.select_little_item').eq(options.index).remove();
            }
        },

        bindEvent: function () {
            var self = this;
            // 展示下拉框按钮点击事件
            $(this.selectDom).click(function (e) {
                e.stopPropagation();
                self.show();
            });

            $(this.$selectArea).click(function (e) {
                e.stopPropagation();
                $(e.target).hasClass('zf_selector_dropDown_area') && self.hide();
            });

            $(this.$selectArea).find('.select_list').click(function (e) {
                e.stopPropagation();
            });

            // 选中展示列表中，小叉叉的点击事件
            $(this.selectDom).on('click', '.select_little_item i', function (e) {
                e.stopPropagation();

                var index = $(this).parents('.select_little_item').eq(0).attr('index');
                $(this).parents('.select_little_item').eq(0).remove();
                // 在选中的列表中删除对应的项
                for (var i = 0; i < self.selectDataArr.length; i++) {
                    // 如果即将要删除的那个项对应的index，和数据源中的$index相等，那么就去除selectDataArr中对应的第i个元素
                    if (self.selectDataArr[i].$index === index) {
                        // 删除元数据
                        self.selectDataArr.splice(i, 1);

                        // 在下拉框中对应的项中去除选中
                        self.$selectItems.eq(parseInt(index, 10) + 1).find('input[type=checkbox]').prop('checked', '');
                    }
                }
            });

            // 绑定列表中checkbox的事件
            this.$selectItems.find('input[type=checkbox]').click(function (e) {
                e.stopPropagation();
            });
            this.$selectItems.find('input[type=checkbox]').on('change', function (e) {
                e.stopPropagation();

                var index = this.getAttribute('index');
                // ============如果点中的是全选按钮=============
                if (index === '-1') {
                    // 设置全部的checkbox的状态
                    self.$selectItems.find('input[type=checkbox]').prop('checked', this.checked ? 'checked' : '');
                    // 在选中库里面添加数据
                    self.selectDataArr = this.checked ? deepClone(self.dataArr) : [];

                    // 在选中的列表展示栏中展示选中的项
                    this.checked ? self.renderSelector({
                        type: '0'
                    }) : self.renderSelector({
                        type: '1'
                    });
                    return;
                }
                var selectObj = deepClone(self.dataArr[index]);
                if (this.checked) {
                    // 如果是选中状态
                    self.selectDataArr.push(selectObj);

                    // 在选中的列表展示栏中添加选中的项
                    self.renderSelector({
                        type: '2',
                        obj: selectObj
                    });
                    // 判断是否全部选中，如果全部选中，则勾选全部选中勾选框
                    if (self.selectDataArr.length === self.dataArr.length) {
                        self.$selectItems.eq(0).find('input[type=checkbox]').prop('checked', true);
                    }
                } else {
                    // 如果不是选中状态，则需要在选中的列表中删除对应的项
                    for (var i = 0; i < self.selectDataArr.length; i++) {
                        // 如果即将要删除的那个项对应的index 减去 1，和数据源中的$index相等，那么就去除selectDataArr中对应的第i个元素
                        if (self.selectDataArr[i].$index === index) {
                            // 删除元数据
                            self.selectDataArr.splice(i, 1);

                            // 在选中的列表展示栏中删除相应的项
                            self.renderSelector({
                                type: '3',
                                obj: selectObj,
                                index: i + ''
                            });
                        }
                    }
                    // 判断全部选中勾选框是否选中，如果选中，则取消勾选
                    self.$selectItems.eq(0).find('input[type=checkbox]').prop('checked') && self.$selectItems.eq(0).find('input[type=checkbox]').prop('checked', '');
                }
            });
            $(this.selectDom).on('sizeChange', function () {
                self.initDropDownListPosition();
            });
        },

        // 为下拉框尺寸变化添加监听事件
        addSizeChangeListener: function () {
            if (this.selectDom.offsetHeight !== this.selectDomHeight) {
                this.selectDomHeight = this.selectDom.offsetHeight;
                $(this.selectDom).trigger('sizeChange');
            }
            if (this.selectDom.offsetWidth !== this.selectDomWidth) {
                this.selectDom.offsetWidth = this.selectDomWidth;
                $(this.selectDom).trigger('sizeChange');
            }
            var self = this;
            setTimeout(function () {
                self.addSizeChangeListener();
            }, 100);
        }
    };

    window.multiSelector = multiSelector;
})(window);