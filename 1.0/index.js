/**
 * 图片剪裁组件
 * author 元泉
 * date 2013-3-31
 */
KISSY.add(function (S, Resize, Drag) {
    var $ = S.all, Event = S.Event, DOM = S.DOM;

    function ImgCrop(option) {
        ImgCrop.superclass.constructor.apply(this, arguments);
        this._init();
    }

    ImgCrop.ATTRS = {
        areaEl:{
            value:''
        },
        areaWidth:{
            value:0
        },
        areaHeight:{
            value:0
        },
        url:{
            value:''
        },
        initWidth:{
            value:100
        },
        initHeight:{
            value:100
        },
        resize:{
            value:true
        },
        scale:{
            value:false
        },
        opacity:{
            value:50
        },
        color:{
            value:'#000'
        },
        min:{
            value:false
        },
        minHeight:{
            value:100
        },
        minWidth:{
            value:100
        },
        preview:{
            value:''
        },
        viewHeight:{
            value:300
        },
        viewWidth:{
            value:300
        },
        initialXY:{
            value:[50, 50]
        }
    };
    S.extend(ImgCrop, S.Base, {
        _init:function () {
            var self = this;
            self._render();
            self._bind();
        },
        _bind:function () {
            var self = this;
            self.on('*Change', function (e) {
                self._loadImage();
            });
            Event.on(self._tempImg, 'load', self._onImgLoad, self);
        },
        _render:function () {
            var self = this;
            self.area = $(self.get('areaEl')).css('overflow', 'hidden').html('');
            self.preview = $(self.get('preview')).html('');
            self.area.css('position', 'relative');
            self.wrap = $('<div class="crop-wrap">');
            self.wrap.append(self._createDragEl()).appendTo(self.area);
            self.get('areaWidth') ? self.area.width(self.get('areaWidth')) : self.set('areaWidth', self.area.width());
            self.get('areaHeight') ? self.area.height(self.get('areaHeight')) : self.set('areaHeight', self.area.height());
            self._layBase = new Image(); //底层
            self._layCropper = new Image(); //切割层
            self._tempImg = new Image(); //原图
            self.wrap.append(self._layBase).append(self._layCropper);
            self._setPreview();
            self._loadImage();
        },
        _createDragEl:function () {
            var self = this;
            var _el = self.el = $('<div class="crop">');
            if (self.get("resize")) {
                S.each(['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l'], function (id) {
                    _el.append($('<div class="crop-point point-' + id + '">'));
                });
            }
            _el.css({
                'position':'absolute',
                'left':self.get('initialXY')[0],
                'top':self.get('initialXY')[1],
                'width':self.get('initWidth'),
                'height':self.get('initHeight'),
                'display':'none'
            });
            return _el;
        },
        _loadImage:function () {
            var self = this;
            self._layBase.style.visibility = self._layCropper.style.visibility = 'hidden';
            //加载图片，为了保证每次调用都能触发load事件加一个随机数
            self._tempImg.src = self._layBase.src = self._layCropper.src = self.get("url") + "?nocache=" + S.guid();
            if (self._view) {
                self._view.src = self._tempImg.src;
            }
        },
        _onImgLoad:function () {
            this._initStyle();
            this._setImgSize();
            this._setPos();
            this._initDrag();
            this._initResize();
        },
        _initDrag:function () {
            var self = this;
            //设置拖放
            self._drag = new Drag(self.el, {
                Max:true,
                mxContainer:self.wrap,
                onstart:function (e) {
                    self.fire("dragstart", e);
                }, //开始移动时执行
                onmove:function (e) {
                    self._setPos();
                    self.fire("drag", e);
                }, //移动时执行
                onstop:function (e) {
                    self.fire("dragend", e);
                }
            });
        },
        _initResize:function () {
            var self = this;
            //设置缩放
            if (self.get('resize')) {
                self._resize = new Resize(self.el, {
                    Max:true,
                    Min:self.get("min"),
                    Scale:self.get("scale"),
                    Ratio:self.get("ratio"),
                    minWidth:self.get("minWidth"),
                    minHeight:self.get("minHeight"),
                    mxContainer:self.wrap,
                    onResize:function (e) {
                        self._setPos();
                        self.fire("resize", e);
                    },
                    onResizeStart:function (e) {
                        self.fire("resizestart", e);
                    },
                    onResizeEnd:function (e) {
                        self.fire("resizeend", e);
                    }
                });
            }
        },
        _initStyle:function () {
            var self = this;
            //设置样式
            self.wrap.css({
                position:'relative',
                overflow:'hidden',
                background:self.get("color")
            });
            self.el.css('z-index', 200);
            DOM.css(self._layCropper, {
                zIndex:100,
                position:'absolute',
                top:0,
                left:0
            });
            DOM.css(self._layBase, {
                position:'absolute',
                opacity:self.get("opacity") / 100,
                top:0,
                left:0
            });
        },
        _adjustPos:function () {
            var self = this;
            var p = self._getPos();
            var _wrapWidth = self.wrap.width();
            var _wrapHeight = self.wrap.height();
            if (p.x + p.w > _wrapWidth) {
                self.el.width(_wrapWidth - p.x);
            }
            if (p.y + p.h > _wrapHeight) {
                self.el.height(_wrapHeight - p.y);
            }
        },
        //设置切割样式
        _setPos:function () {
            var self = this;
            //ie6渲染bug
            self.el.css('zoom', 0.5);
            self.el.css({
                zoom:1,
                display:'block'
            });
            self._adjustPos();
            var p = self._getPos();
            //按拖放对象的参数进行切割
            self._layCropper.style.clip = "rect(" + p.y + "px " + (p.x + p.w) + "px " + (p.y + p.h) + "px " + p.x + "px)";
            //设置预览
            self._view && self._setPrePos();
        },
        //设置预览效果
        _setPreview:function () {
            var self = this;
            //设置预览对象
            var preWrap = S.one(self.get("preview")); //预览对象
            if (preWrap) {
                self._view = new Image();
                self._view.style.position = "absolute";
                preWrap.append(self._view);
                preWrap.css({
                    position:'relative',
                    overflow:'hidden'
                });
            }
        },
        _setPrePos:function () {
            var self = this;
            //预览显示的宽和高
            var p = self._getPos(),
                s = self._getSize(p.w, p.h, self.get("viewWidth") || DOM.width(preWrap), self.get("viewHeight") || DOM.height(preWrap)),
                scale = s.height / p.h,
                pTop = p.y * scale,
                pLeft = p.x * scale;
            //设置预览对象
            DOM.css(self._view, {
                width:self._layBase.width * scale,
                height:self._layBase.height * scale,
                top:-pTop,
                left:-pLeft,
                clip:"rect(" + pTop + "px " + (pLeft + s.width) + "px " + (pTop + s.height) + "px " + pLeft + "px)"
            });
        },
        //获取尺寸
        _getSize:function (imgW, imgH, conW, conH) {
            var width = imgW * 1.0;
            var height = imgH * 1.0;
            var new_width;
            var new_height;
            if ((width / conW) > (height / conH)) {
                new_width = Math.min(conW, width);
                new_height = new_width * height / width;
            } else {
                new_height = Math.min(conH, height);
                new_width = new_height * width / height;
            }
            return {
                width:new_width,
                height:new_height
            };
        },
        //设置图片大小
        _setImgSize:function () {
            var self = this;
            var s = self._getSize(self._tempImg.width, self._tempImg.height, self.get("areaWidth"), self.get("areaHeight"));
            //设置底图和切割图
            self._layBase.style.width = self._layCropper.style.width = s.width + "px";
            self._layBase.style.height = self._layCropper.style.height = s.height + "px";
            self.wrap.css({
                'position':'absolute',
                'width':s.width,
                'height':s.height,
                'top':(self.area.height() - s.height) / 2,
                'left':(self.area.width() - s.width) / 2
            });
            self._layBase.style.visibility = self._layCropper.style.visibility = 'visible';
            self.fire("imgload", {
                width:s.width,
                height:s.height
            });
            return s;
        },
        //获取当前样式
        _getPos:function () {
            return {
                y:parseFloat(this.el.css('top')),
                x:parseFloat(this.el.css('left')),
                w:parseFloat(this.el.css('width')),
                h:parseFloat(this.el.css('height'))
            };
        },
        /**
         * 当前显示图片的尺寸
         * @return {*}
         */
        getCurSize:function () {
            return this._getSize(this._tempImg.width, this._tempImg.height, this.get("areaWidth"), this.get("areaHeight"));
        },
        /**
         * 原始图片的尺寸
         * @return {Object}
         */
        getOriSize:function () {
            return {
                width:parseInt(this._tempImg.width, 10),
                height:parseInt(this._tempImg.height, 10)
            };
        },
        /**
         * 剪裁区域图片信息
         * @return {Object}
         */
        getInfo:function () {
            var info = this._getPos();
            var r = parseInt(this._tempImg.width, 10) / parseInt(this._layBase.width, 10);
            var result = {
                y:info.y,
                x:info.x,
                w:info.w,
                h:info.h,
                r:r,
                src:this.get("url")
            };
            return result;
        },
        /**
         * 重新设置剪裁区域位置
         * @param x
         * @param y
         * @param w
         * @param h
         */
        resetCrop:function (x, y, w, h) {
            this.el.css({
                width:w, height:h, top:y, left:x
            });
            this._setPos();
        },
        show:function () {
            this.area.show();
        },
        hide:function () {
            this.area.hide();
        },
        destroy:function () {
            Event.remove(this.area);
            this.area.html("");
            this.preview.html("");
            for (var a in this) {
                if (this.hasOwnProperty(a)) {
                    delete this[a];
                }
            }
        }
    });
    return ImgCrop;
}, {
    requires:['imgcrop/resizable', 'imgcrop/dragable']
});
/**
 * resize组件
 */
KISSY.add('imgcrop/resizable', function (S) {
    var Event = S.Event, DOM = S.DOM;
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
                    Right:".point-r", Left:".point-l", Up:".point-t", Down:".point-b",
                    RightDown:".point-rb", LeftDown:".point-lb", RightUp:".point-rt", LeftUp:".point-lt"
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
});
/**
 *拖拽组件
 */
KISSY.add('imgcrop/dragable', function (S) {
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
            this._marginLeft = parseInt(DOM.css(this.Drag, 'margin-left'), 10);
            this._marginTop = parseInt(DOM.css(this.Drag, 'margin-top'), 10);
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

