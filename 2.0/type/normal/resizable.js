/**
 * resize组件
 */
KISSY.add(function (S) {
    var Event = S.Event,
        DOM = S.DOM;
    //缩放程序
    function Resize() {
        this.initialize.apply(this, arguments);
    }

    S.augment(Resize, {
        //缩放对象
        initialize:function (obj, options) {
            var self = this;
            this._obj = DOM.get(obj); //缩放对象
            this._styleWidth = this._styleHeight = this._styleLeft = this._styleTop = 0; //样式参数
            this._sideRight = this._sideDown = this._sideLeft = this._sideUp = 0; //坐标参数
            this._fixLeft = this._fixTop = 0; //定位参数
            this._scaleLeft = this._scaleTop = 0; //定位坐标
            this._mxSet = function () {
            }; //范围设置程序
            this._mxRightWidth = this._mxDownHeight = this._mxUpHeight = this._mxLeftWidth = 0; //范围参数
            this._mxScaleWidth = this._mxScaleHeight = 0; //比例范围参数
            this._fun = function () {
            }; //缩放执行程序
            //获取边框宽度
            this._borderX = parseInt(DOM.css(this._obj, "border-left-width"), 10) + parseInt(DOM.css(this._obj, "border-right-width"), 10);
            this._borderY = parseInt(DOM.css(this._obj, "border-top-width"), 10) + parseInt(DOM.css(this._obj, "border-bottom-width"), 10);
            this.setOptions(options);
            //范围限制
            this.Max = !!this.options.Max;
            this._mxContainer = DOM.get(this.options.mxContainer) || null;
            this.mxLeft = Math.round(this.options.mxLeft);
            this.mxRight = Math.round(this.options.mxRight);
            this.mxTop = Math.round(this.options.mxTop);
            this.mxBottom = Math.round(this.options.mxBottom);
            //宽高限制
            this.Min = !!this.options.Min;
            this.minWidth = Math.round(this.options.minWidth);
            this.minHeight = Math.round(this.options.minHeight);
            //按比例缩放
            this.Scale = !!this.options.Scale;
            this.Ratio = Math.max(this.options.Ratio, 0);
            this._obj.style.position = "absolute";
            if (this._mxContainer) {
                DOM.css(this._mxContainer, 'position', 'relative');
            }
            // 给触点注册事件
            S.each(this.options.Points, function (point, dir) {
                (function (point, dir) {
                    Event.on(point, "mousedown", function (e) {
                        e.funName = dir;
                        self.start(e);
                    });
                })(point, dir);
            });
        },
        //设置默认属性
        setOptions:function (options) {
            this.options = { //默认值
                Max:false, //是否设置范围限制(为true时下面mx参数有用)
                mxContainer:"", //指定限制在容器内
                mxLeft:0, //左边限制
                mxRight:9999, //右边限制
                mxTop:0, //上边限制
                mxBottom:9999, //下边限制
                Min:false, //是否最小宽高限制(为true时下面min参数有用)
                minWidth:50, //最小宽度
                minHeight:50, //最小高度
                Scale:false, //是否按比例缩放
                Ratio:0, //缩放比例(宽/高)
                Points:{
                    Right:".point-r",
                    Left:".point-l",
                    Up:".point-t",
                    Down:".point-b",
                    RightDown:".point-rb",
                    LeftDown:".point-lb",
                    RightUp:".point-rt",
                    LeftUp:".point-lt"
                },
                onResize:function () {
                },
                onResizeStart:function () {
                },
                onResizeEnd:function () {
                }
                //缩放时执行
            };
            S.mix(this.options, options);
        },
        //准备缩放
        start:function (e) {
            //防止冒泡(跟拖放配合时设置)
            e.halt();
            //设置执行程序
            this._fun = this[e.funName];
            //样式参数值
            this._styleWidth = this._obj.clientWidth;
            this._styleHeight = this._obj.clientHeight;
            this._styleLeft = this._obj.offsetLeft;
            this._styleTop = this._obj.offsetTop;
            //四条边定位坐标
            this._sideLeft = e.clientX - this._styleWidth;
            this._sideRight = e.clientX + this._styleWidth;
            this._sideUp = e.clientY - this._styleHeight;
            this._sideDown = e.clientY + this._styleHeight;
            //top和left定位参数
            this._fixLeft = this._styleLeft + this._styleWidth;
            this._fixTop = this._styleTop + this._styleHeight;
            //缩放比例
            if (this.Scale) {
                //设置比例
                this.Ratio = this._styleWidth / this._styleHeight;
                //left和top的定位坐标
                this._scaleLeft = this._styleLeft + this._styleWidth / 2;
                this._scaleTop = this._styleTop + this._styleHeight / 2;
            }
            //范围限制
            if (this.Max) {
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
                //根据最小值再修正
                mxRight = Math.max(mxRight, mxLeft + (this.Min ? this.minWidth : 0) + this._borderX);
                mxBottom = Math.max(mxBottom, mxTop + (this.Min ? this.minHeight : 0) + this._borderY);
                //由于转向时要重新设置所以写成function形式
                this._mxSet = function () {
                    this._mxRightWidth = mxRight - this._styleLeft - this._borderX;
                    this._mxDownHeight = mxBottom - this._styleTop - this._borderY;
                    this._mxUpHeight = Math.max(this._fixTop - mxTop, this.Min ? this.minHeight : 0);
                    this._mxLeftWidth = Math.max(this._fixLeft - mxLeft, this.Min ? this.minWidth : 0);
                };
                this._mxSet();
                //有缩放比例下的范围限制
                if (this.Scale) {
                    this._mxScaleWidth = Math.min(this._scaleLeft - mxLeft, mxRight - this._scaleLeft - this._borderX) * 2;
                    this._mxScaleHeight = Math.min(this._scaleTop - mxTop, mxBottom - this._scaleTop - this._borderY) * 2;
                }
            }
            //mousemove时缩放 mouseup时停止
            Event.on(document, "mousemove", this.resize, this);
            Event.on(document, "mouseup", this.stop, this);
            this.options.onResizeStart(e);
        },
        //停止缩放
        stop:function (e) {
            Event.detach(document, "mousemove", this.resize, this);
            Event.detach(document, "mouseup", this.stop, this);
            this.options.onResizeEnd(e);
        },
        //缩放
        resize:function (e) {
            //清除选择
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            //执行缩放程序
            this._fun(e);
            //设置样式，变量必须大于等于0否则ie出错
            this._obj.style.width = this._styleWidth + "px";
            this._obj.style.height = this._styleHeight + "px";
            this._obj.style.top = this._styleTop + "px";
            this._obj.style.left = this._styleLeft + "px";
            //附加程序
            this.options.onResize(e);
        },
        //缩放程序
        //上
        Up:function (e) {
            this.RepairY(this._sideDown - e.clientY, this._mxUpHeight);
            this.RepairTop();
            this.TurnDown(this.Down);
        },
        //下
        Down:function (e) {
            this.RepairY(e.clientY - this._sideUp, this._mxDownHeight);
            this.TurnUp(this.Up);
        },
        //右
        Right:function (e) {
            this.RepairX(e.clientX - this._sideLeft, this._mxRightWidth);
            this.TurnLeft(this.Left);
        },
        //左
        Left:function (e) {
            this.RepairX(this._sideRight - e.clientX, this._mxLeftWidth);
            this.RepairLeft();
            this.TurnRight(this.Right);
        },
        //右下
        RightDown:function (e) {
            this.RepairAngle(e.clientX - this._sideLeft, this._mxRightWidth, e.clientY - this._sideUp, this._mxDownHeight);
            this.TurnLeft(this.LeftDown) || this.TurnUp(this.RightUp);
        },
        //右上
        RightUp:function (e) {
            this.RepairAngle(e.clientX - this._sideLeft, this._mxRightWidth, this._sideDown - e.clientY, this._mxUpHeight);
            this.RepairTop();
            this.TurnLeft(this.LeftUp) || this.TurnDown(this.RightDown);
        },
        //左下
        LeftDown:function (e) {
            this.RepairAngle(this._sideRight - e.clientX, this._mxLeftWidth, e.clientY - this._sideUp, this._mxDownHeight);
            this.RepairLeft();
            this.TurnRight(this.RightDown) || this.TurnUp(this.LeftUp);
        },
        //左上
        LeftUp:function (e) {
            this.RepairAngle(this._sideRight - e.clientX, this._mxLeftWidth, this._sideDown - e.clientY, this._mxUpHeight);
            this.RepairTop();
            this.RepairLeft();
            this.TurnRight(this.RightUp) || this.TurnDown(this.LeftDown);
        },
        //修正程序
        //水平方向
        RepairX:function (iWidth, mxWidth) {
            iWidth = this.RepairWidth(iWidth, mxWidth);
            if (this.Scale) {
                var iHeight = Math.round(iWidth / this.Ratio);
                if (this.Max && iHeight > this._mxScaleHeight) {
                    iWidth = Math.round((iHeight = this._mxScaleHeight) * this.Ratio);
                } else if (this.Min && iHeight < this.minHeight) {
                    var tWidth = Math.round(this.minHeight * this.Ratio);
                    if (tWidth < mxWidth) {
                        iHeight = this.minHeight;
                        iWidth = tWidth;
                    }
                }
                this._styleHeight = iHeight;
                this._styleTop = this._scaleTop - iHeight / 2;
            }
            this._styleWidth = iWidth;
        },
        //垂直方向
        RepairY:function (iHeight, mxHeight) {
            iHeight = this.RepairHeight(iHeight, mxHeight);
            if (this.Scale) {
                var iWidth = Math.round(iHeight * this.Ratio);
                if (this.Max && iWidth > this._mxScaleWidth) {
                    iHeight = Math.round((iWidth = this._mxScaleWidth) / this.Ratio);
                } else if (this.Min && iWidth < this.minWidth) {
                    var tHeight = Math.round(this.minWidth / this.Ratio);
                    if (tHeight < mxHeight) {
                        iWidth = this.minWidth;
                        iHeight = tHeight;
                    }
                }
                this._styleWidth = iWidth;
                this._styleLeft = this._scaleLeft - iWidth / 2;
            }
            this._styleHeight = iHeight;
        },
        //对角方向
        RepairAngle:function (iWidth, mxWidth, iHeight, mxHeight) {
            iWidth = this.RepairWidth(iWidth, mxWidth);
            if (this.Scale) {
                iHeight = Math.round(iWidth / this.Ratio);
                if (this.Max && iHeight > mxHeight) {
                    iWidth = Math.round((iHeight = mxHeight) * this.Ratio);
                } else if (this.Min && iHeight < this.minHeight) {
                    var tWidth = Math.round(this.minHeight * this.Ratio);
                    if (tWidth < mxWidth) {
                        iHeight = this.minHeight;
                        iWidth = tWidth;
                    }
                }
            } else {
                iHeight = this.RepairHeight(iHeight, mxHeight);
            }
            this._styleWidth = iWidth;
            this._styleHeight = iHeight;
        },
        //top
        RepairTop:function () {
            this._styleTop = this._fixTop - this._styleHeight;
        },
        //left
        RepairLeft:function () {
            this._styleLeft = this._fixLeft - this._styleWidth;
        },
        //height
        RepairHeight:function (iHeight, mxHeight) {
            iHeight = Math.min(this.Max ? mxHeight : iHeight, iHeight);
            iHeight = Math.max(this.Min ? this.minHeight : iHeight, iHeight, 0);
            return iHeight;
        },
        //width
        RepairWidth:function (iWidth, mxWidth) {
            iWidth = Math.min(this.Max ? mxWidth : iWidth, iWidth);
            iWidth = Math.max(this.Min ? this.minWidth : iWidth, iWidth, 0);
            return iWidth;
        },
        //转向程序
        //转右
        TurnRight:function (fun) {
            if (!(this.Min || this._styleWidth)) {
                this._fun = fun;
                this._sideLeft = this._sideRight;
                this.Max && this._mxSet();
                return true;
            }
        },
        //转左
        TurnLeft:function (fun) {
            if (!(this.Min || this._styleWidth)) {
                this._fun = fun;
                this._sideRight = this._sideLeft;
                this._fixLeft = this._styleLeft;
                this.Max && this._mxSet();
                return true;
            }
        },
        //转上
        TurnUp:function (fun) {
            if (!(this.Min || this._styleHeight)) {
                this._fun = fun;
                this._sideDown = this._sideUp;
                this._fixTop = this._styleTop;
                this.Max && this._mxSet();
                return true;
            }
        },
        //转下
        TurnDown:function (fun) {
            if (!(this.Min || this._styleHeight)) {
                this._fun = fun;
                this._sideUp = this._sideDown;
                this.Max && this._mxSet();
                return true;
            }
        }
    });
    return Resize;
}, {
    attach:false
});
