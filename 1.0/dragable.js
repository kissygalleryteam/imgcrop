
/**
 *拖拽组件
 */
KISSY.add('gallery/imgcrop/1.0/dragable', function (S) {
    var Event = S.Event, DOM = S.DOM, ie = S.UA.ie;
    //拖放程序
    function Drag() {
        this.initialize.apply(this, arguments);
    }

    S.augment(Drag, {
        //拖放对象
        initialize:function (drag, options) {
            this.Drag = DOM.get(drag); //拖放对象
            this._x = this._y = 0; //记录鼠标相对拖放对象的位置
            this._marginLeft = this._marginTop = 0; //记录margin
            //事件对象(用于绑定移除事件)
            this.setOptions(options);
            this.Limit = !!this.options.Limit;
            this.mxLeft = parseInt(this.options.mxLeft);
            this.mxRight = parseInt(this.options.mxRight);
            this.mxTop = parseInt(this.options.mxTop);
            this.mxBottom = parseInt(this.options.mxBottom);
            this.LockX = !!this.options.LockX;
            this.LockY = !!this.options.LockY;
            this.Lock = !!this.options.Lock;
            this._Handle = DOM.get(this.options.Handle) || this.Drag;
            this._mxContainer = DOM.get(this.options.mxContainer) || null;
            this._Handle.style.position = "absolute";
            //修正范围
            this.Repair();
            Event.on(this._Handle, "mousedown", this.start, this);
        },
        //设置默认属性
        setOptions:function (options) {
            this.options = { //默认值
                Handle:"", //设置触发对象（不设置则使用拖放对象）
                Limit:true, //是否设置范围限制(为true时下面参数有用,可以是负数)
                mxLeft:0, //左边限制
                mxRight:9999, //右边限制
                mxTop:0, //上边限制
                mxBottom:9999, //下边限制
                mxContainer:"", //指定限制在容器内
                LockX:false, //是否锁定水平方向拖放
                LockY:false, //是否锁定垂直方向拖放
                Lock:false, //是否锁定
                Transparent:true, //是否透明
                onstart:function () {
                }, //开始移动时执行
                onmove:function () {
                }, //移动时执行
                onstop:function () {
                }//结束移动时执行
            };
            S.mix(this.options, options);
        },
        //准备拖动
        start:function (e) {
            e.preventDefault();
            if (this.Lock) {
                return;
            }
            this.Repair();
            //记录鼠标相对拖放对象的位置
            this._x = e.clientX - this.Drag.offsetLeft;
            this._y = e.clientY - this.Drag.offsetTop;
            //记录margin
            this._marginLeft = parseInt(DOM.css(this.Drag, 'margin-left'), 10) || this._marginLeft;
            this._marginTop = parseInt(DOM.css(this.Drag, 'margin-top'), 10) || this._marginTop;
            //mousemove时移动 mouseup时停止
            Event.on(document, "mousemove", this.move, this);
            Event.on(document, "mouseup", this.stop, this);
            //附加程序
            this.options.onstart(e);
        },
        //停止拖动
        stop:function (e) {
            //移除事件
            Event.detach(document, "mousemove", this.move, this);
            Event.detach(document, "mouseup", this.stop, this);
            //附加程序
            this.options.onstop(e);
        },
        //修正范围
        Repair:function () {
            if (this.Limit) {
                //修正错误范围参数
                this.mxRight = Math.max(this.mxRight, this.mxLeft + this.Drag.offsetWidth);
                this.mxBottom = Math.max(this.mxBottom, this.mxTop + this.Drag.offsetHeight);
                //如果有容器必须设置position为relative来相对定位，并在获取offset之前设置
                if (this._mxContainer) {
                    DOM.css(this._mxContainer, 'position', 'relative');
                }
            }
        },
        //拖动
        move:function (e) {
            //判断是否锁定
            if (this.Lock) {
                this.stop();
                return;
            }
            //清除选择
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            //设置移动参数
            var iLeft = e.clientX - this._x,
                iTop = e.clientY - this._y;
            //设置范围限制
            if (this.Limit) {
                //设置范围参数
                var mxLeft = this.mxLeft,
                    mxRight = this.mxRight,
                    mxTop = this.mxTop,
                    mxBottom = this.mxBottom;
                //如果设置了容器，再修正范围参数
                if (!!this._mxContainer) {
                    mxLeft = Math.max(mxLeft, 0);
                    mxTop = Math.max(mxTop, 0);
                    mxRight = Math.min(mxRight, this._mxContainer.clientWidth);
                    mxBottom = Math.min(mxBottom, this._mxContainer.clientHeight);
                }
                //修正移动参数
                iLeft = Math.max(Math.min(iLeft, mxRight - this.Drag.offsetWidth), mxLeft);
                iTop = Math.max(Math.min(iTop, mxBottom - this.Drag.offsetHeight), mxTop);
            }
            //设置位置，并修正margin
            if (!this.LockX) {
                this.Drag.style.left = iLeft - this._marginLeft + "px";
            }
            if (!this.LockY) {
                this.Drag.style.top = iTop - this._marginTop + "px";
            }
            //附加程序
            this.options.onmove(e);
        }
    });
    return Drag;
});
