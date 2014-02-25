/*
combined files : 

gallery/imgcrop/2.1/type/html5/preview
gallery/imgcrop/2.1/type/html5/selection
gallery/imgcrop/2.1/type/html5/imgcrop
gallery/imgcrop/2.1/type/normal/resizable
gallery/imgcrop/2.1/type/normal/dragable
gallery/imgcrop/2.1/type/normal/imgcrop
gallery/imgcrop/2.1/index

*/
/**
 * @Preview 预览模块
 * @author 元泉 2013-5-4
 */
KISSY.add('gallery/imgcrop/2.1/type/html5/preview',function (S) {
    var $ = S.all;
    //预览对象
    function Preview() {
        Preview.superclass.constructor.apply(this, arguments);
        this.canvas = $('<canvas>');
        this.ctx = this.canvas[0].getContext('2d');
        this._init();
    }

    Preview.ATTRS = {
        previewEl:{
            value:''
        },
        viewHeight:{
            value:100
        },
        viewWidth:{
            value:100
        },
        image:{
            value:null
        }
    };
    S.extend(Preview, S.Base, {
        _init:function () {
            this.container = $(this.get('previewEl'));
            this._build();
        },
        _build:function () {
            var self = this;
            var viewWidth = self.get('viewWidth');
            var viewHeight = self.get('viewHeight');
            self.container.css({
                position:"relative",
                width:viewWidth || self.container.width(),
                height:viewHeight || self.container.height()
            });
            self.container.html('').append(self.canvas.css({
                position:'absolute'
            }));

            self.canvas[0].width = self.canvasW = viewWidth;
            self.canvas[0].height = self.canvasH = viewHeight;
        },
        _rejustSize:function (imgW, imgH, conW, conH) {
            var new_width, new_height;
            if ((imgW / conW) > (imgH / conH)) {
                new_width = Math.min(conW, imgW);
                new_height = new_width * imgH / imgW;
            } else {
                new_height = Math.min(conH, imgH);
                new_width = new_height * imgW / imgH;
            }
            return {
                w : new_width,
                h : new_height,
                x : (conW - new_width)/2,
                y : (conH - new_height)/2
            };
        },
        draw:function (x, y, w, h, r) {
            var self = this;
            // clear canvas
            self.ctx.clearRect(0, 0, self.canvasW, self.canvasH);
            var oriCoords = {
                x : Math.floor(x * r),
                y : Math.floor(y * r),
                w : Math.floor(w * r),
                h : Math.floor(h * r)
            };
            var newCoords = self._rejustSize(oriCoords.w, oriCoords.h, self.canvasW, self.canvasH);
            self.ctx.drawImage(self.get('image'), oriCoords.x, oriCoords.y, oriCoords.w, oriCoords.h, newCoords.x, newCoords.y, newCoords.w, newCoords.h);
        },
        destroy:function () {
            this.canvas.remove();
        }
    });
    return Preview;
}, {
    attach:false
});

/**
 * @Selection 图像选择模块
 * @author 元泉 2013-8-17
 */
KISSY.add('gallery/imgcrop/2.1/type/html5/selection',function (S) {
	//选择对象
	function Selection() {
		Selection.superclass.constructor.apply(this, arguments);
		this.csize = 3; // resize cubes size
		this.bDrag = [false, false, false, false]; // drag statuses
		this.bDragAll = false; // drag whole selection
	}

	Selection.ATTRS = {
		x : {
			value : 0
		},
		y : {
			value : 0
		},
		w : {
			value : 50
		},
		h : {
			value : 50
		},
		ratio : {
			value : false
		},
		minWidth : {
			value : 50
		},
		minHeight : {
			value : 50
		},
		resizable : {
			value : true
		},
		borderColor : {
			value : '#fff'
		},
		cubesColor : {
			value : '#fff'
		},
		maskColor : {
			value : "#000"
		},
		maskOpacity : {
			value : "0.5"
		},
		constraint : {
			value : [10000, 10000]
		}
	};
	S.extend(Selection, S.Base, {
		event : {
			DRAG : "drag",
			START_DRAG : "startdrag",
			END_DRAG : "enddrag",
			RESIZE : "resize",
			START_RESIZE : "startresize",
			END_RESIZE : "endresize"
		},
		/**
		 * 绘画
		 * @param ctx
		 * @param image
		 */
		draw : function (ctx, image) {
			var self = this;
			var canvasW = ctx.canvas.width;
			var canvasH = ctx.canvas.height;
			// clear canvas
			ctx.clearRect(0, 0, canvasW, canvasH);
			// draw source image
			ctx.drawImage(image, 0, 0, canvasW, canvasH);

			ctx.strokeStyle = self.get('borderColor');
			ctx.lineWidth = 1;
			var rect = {
				w : Math.min(Math.max(self.get('w'), self.get('minWidth')), canvasW),
				h : Math.min(Math.max(self.get('h'), self.get('minHeight')), canvasH),
				x : Math.min(Math.max(self.get('x'), 0), canvasW - self.get('w')),
				y : Math.min(Math.max(self.get('y'), 0), canvasH - self.get('h'))
			};
			self.set(rect);
			ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

			// and make mask
			ctx.fillStyle = self.get('maskColor');
			ctx.globalAlpha = self.get('maskOpacity');
			ctx.fillRect(0, 0, canvasW, self.get('y'));
			ctx.fillRect(0, self.get('y'), self.get('x'), self.get('h'));
			ctx.fillRect(self.get('x') + self.get('w'), self.get('y'), canvasW - self.get('x') - self.get('w'), self.get('h'));
			ctx.fillRect(0, self.get('y') + self.get('h'), canvasW, canvasH - self.get('y') - self.get('h'));
			ctx.globalAlpha = '1';

			/**
			 * 鼠标形状
			 * @type {String}
			 */
			ctx.canvas.style.cursor = self.cursor;
			/**
			 * 如果支持缩放
			 */
			if (self.get('resizable')) {
				// draw resize cubes
				ctx.fillStyle = self.get('cubesColor');
				ctx.fillRect(self.get('x') - self.csize, self.get('y') - self.csize, self.csize * 2, self.csize * 2);
				ctx.fillRect(self.get('x') + self.get('w') - self.csize, self.get('y') - self.csize, self.csize * 2, self.csize * 2);
				ctx.fillRect(self.get('x') + self.get('w') - self.csize, self.get('y') + self.get('h') - self.csize, self.csize * 2, self.csize * 2);
				ctx.fillRect(self.get('x') - self.csize, self.get('y') + self.get('h') - self.csize, self.csize * 2, self.csize * 2);
			}
		},
		getInfo : function () {
			return {
				x : this.get('x'),
				y : this.get('y'),
				w : this.get('w'),
				h : this.get('h')
			};
		},
		resize : function (iMouseX, iMouseY) {
			var self = this;
			var iFW,
			iFH,
			iFX,
			iFY;

			if (self.bDrag[0]) {
				iFX = Math.min(iMouseX, self.get('w') + self.get('x') - self.get('minWidth'));
				iFY = Math.min(iMouseY, self.get('h') + self.get('y') - self.get('minHeight'));
				iFW = self.get('w') + self.get('x') - iFX;
				iFH = self.get('h') + self.get('y') - iFY;
			} else if (self.bDrag[1]) {
				iFX = self.get('x');
				iFY = Math.min(iMouseY, self.get('h') + self.get('y') - self.get('minHeight'));
				iFW = iMouseX - iFX;
				iFH = self.get('h') + self.get('y') - iFY;
			} else if (self.bDrag[2]) {
				iFX = self.get('x');
				iFY = self.get('y');
				iFW = iMouseX - iFX;
				iFH = iMouseY - iFY;
			} else if (self.bDrag[3]) {
				iFX = Math.min(iMouseX, self.get('w') + self.get('x') - self.get('minWidth'));
				iFY = self.get('y');
				iFW = self.get('w') + self.get('x') - iFX;
				iFH = iMouseY - iFY;
			}
			//固定比例
			if (self.get("ratio")) {
				var r = self.get('pw') / self.get("ph");
				if (iFW / iFH < r) {
					iFH = iFW / r;
				} else {
					iFW = iFH * r;
				}
			}
			self.set({
				w : iFW,
				x : iFX,
				h : iFH,
				y : iFY
			});
			self.fire(self.event.RESIZE);
		},
		move : function (diffX, diffY) {
			var self = this;
			self.set({
				x : Math.min(Math.max(self.get('px') + diffX, 0), self.get('constraint')[0] - self.get('pw')),
				y : Math.min(Math.max(self.get('py') + diffY, 0), self.get('constraint')[1] - self.get('ph'))
			});

			self.fire(self.event.DRAG);
		},
		registerPointPos : function (iMouseX, iMouseY) {
			var self = this;
			var code = -1;
			if (iMouseX > self.get('x') + self.csize &&
				iMouseX < self.get('x') + self.get('w') - self.csize &&
				iMouseY > self.get('y') + self.csize &&
				iMouseY < self.get('y') + self.get('h') - self.csize) {
				code = 0;
			} else if (iMouseX > self.get('x') - self.csize && iMouseX < self.get('x') + self.csize &&
				iMouseY > self.get('y') - self.csize && iMouseY < self.get('y') + self.csize) {
				code = 1;
			} else if (iMouseX > self.get('x') + self.get('w') - self.csize && iMouseX < self.get('x') + self.get('w') + self.csize &&
				iMouseY > self.get('y') - self.csize && iMouseY < self.get('y') + self.csize) {
				code = 2;
			} else if (iMouseX > self.get('x') + self.get('w') - self.csize && iMouseX < self.get('x') + self.get('w') + self.csize &&
				iMouseY > self.get('y') + self.get('h') - self.csize && iMouseY < self.get('y') + self.get('h') + self.csize) {
				code = 3;
			} else if (iMouseX > self.get('x') - self.csize && iMouseX < self.get('x') + self.csize &&
				iMouseY > self.get('y') + self.get('h') - self.csize && iMouseY < self.get('y') + self.get('h') + self.csize) {
				code = 4;
			}
			return code;
		},
		markByCode : function (code) {
			var self = this;
			if (code === -1)
				return;
			if (code === 0) {
				self.bDragAll = true;
				self.fire(self.event.START_DRAG);
			} else {
				self.bDrag[code - 1] = true;
				self.fire(self.event.START_RESIZE);
			}
		},
		hoverByCode : function (code) {
			var self = this;
			switch (code) {
			case 0:
				self.cursor = 'move';
				break;
			case 1:
			case 3:
				self.cursor = self.get('resizable') ? 'nw-resize' : 'default';
				break;
			case 2:
			case 4:
				self.cursor = self.get('resizable') ? 'ne-resize' : 'default';
				break;
			default:
				self.cursor = 'default';
			}
		},
		canMove : function () {
			return this.bDragAll;
		},
		canResize : function () {
			return S.inArray(true, this.bDrag);
		},
		reset : function () {
			this.bDragAll = false;
			for (var i = 0; i < this.bDrag.length; i++) {
				this.bDrag[i] = false;
			}
		}
	});
	return Selection;
}, {
	attach : false
});

/*
 * note:
 * 8-17 修复固定比例剪裁resize到边缘变形bug
*/

/**
 * @ImgCrop 图像剪裁组件，基于canvas
 * @author 元泉 2013-5-8
 */
KISSY.add('gallery/imgcrop/2.1/type/html5/imgcrop',function (S, Preview, Selection) {
	var $ = S.all;

	/**
	 * 剪裁对象
	 * @constructor
	 */
	function ImgCrop() {
		ImgCrop.superclass.constructor.apply(this, arguments);
		this.canvas = $('<canvas>');
		this.ctx = this.canvas[0].getContext('2d');
		this.image = new Image();
	}

	/**
	 * 可配置的属性
	 * @type {Object}
	 */
	ImgCrop.ATTRS = {
		/**
		 * 图像的容器{HTMLElement | NodeList | Selector}
		 */
		areaEl : {
			value : ''
		},
		/**
		 * 容器宽度，默认从容器的样式中获得
		 */
		areaWidth : {
			value : 0
		},
		/**
		 * 容器高度，默认从容器的样式中获得
		 */
		areaHeight : {
			value : 0
		},
		/**
		 * 图片的地址
		 */
		url : {
			value : ''
		},
		/**
		 * 视窗的默认宽度
		 */
		initWidth : {
			value : 100
		},
		/**
		 * 视窗的默认高度
		 */
		initHeight : {
			value : 100
		},
		/**
		 * 是否可以缩放
		 */
		resizable : {
			value : true
		},
		/**
		 * 是否固定比例
		 */
		ratio : {
			value : false
		},
		/**
		 * 视窗的最小高度
		 */
		minHeight : {
			value : 10
		},
		/**
		 * 视窗的最小宽度
		 */
		minWidth : {
			value : 10
		},
		/**
		 * 初始坐标
		 */
		initialXY : {
			value : [50, 50]
		},
		/**
		 * 边框颜色
		 */
		borderColor : {
			value : '#fff'
		},
		/**
		 * 小方块颜色
		 */
		cubesColor : {
			value : '#fff'
		},
		/**
		 *  遮罩颜色
		 */
		maskColor : {
			value : '#000'
		},
		/**
		 * 遮罩透明度
		 */
		maskOpacity : {
			value : '0.5'
		},
		/**
		 * 预览窗口，不需要可以不配置{HTMLElement|NodeList}
		 */
		previewEl : {
			value : ''
		},
		/**
		 * 预览窗口高度
		 */
		viewHeight : {
			value : 100
		},
		/**
		 * 预览窗口宽度
		 */
		viewWidth : {
			value : 100
		},
		/**
		 * 是否支持touch、pinch
		 */
		touchable : {
			value : true
		}
	};
	S.extend(ImgCrop, S.Base);
	S.augment(ImgCrop, S.EventTarget, {
		/**
		 * 支持的事件列表
		 */
		event : {
			DRAG : "drag",
			START_DRAG : "startdrag",
			END_DRAG : "enddrag",
			RESIZE : "resize",
			START_RESIZE : "startresize",
			END_RESIZE : "endresize",
			TOUCH : "touch",
			START_TOUCH : "starttouch",
			END_TOUCH : "endtouch",
			PINCH : "pinch",
			START_PINCH : "startpinch",
			END_PINCH : "endpinch",
			IMGLOAD : "imgload"
		},
		/**
		 * 初始化
		 * @private
		 */
		_init : function () {
			var self = this;
			// 该操作从构造函数迁移到init中，在构造函数中的话，如果areaEl新赋值会出问题
			self.container = $(self.get('areaEl'));
			var image = self.image;
			image.onload = function () {
				self._build();
				self._rejustSize(image.width, image.height, self.container.width(), self.container.height());
				self._createSelection();
				self._drawScene();
				self._bind();
				self._createPreview();
				self.fire(self.event.IMGLOAD, self.getOriginalSize());
			};
			image.src = self.get('url');
		},
		/**
		 * 事件绑定
		 * @private
		 */
		_bind : function () {
			var self = this;
			self._unBind();
			self.canvas.on('mousemove', self._handleHover, self);
			self.canvas.on('mousedown', self._handleMouseDown, self);
			$(document).on('mouseup', self._handleMouseUp, self);
			self.on("*Change", self._doAttrChange, self);
			//增加触摸事件
			if (self.get('touchable')) {
				self._bindTouch();
			}
		},
		/**
		 * 事件解绑
		 * @private
		 */
		_unBind : function () {
			var self = this;
			$(document).detach('mousemove', self._handleMouseMove, self);
			self.canvas.detach('mousedown', self._handleMouseDown, self);
			$(document).detach('mouseup', self._handleMouseUp, self);
			self.detach("*Change", self._doAttrChange, self);
		},
		/**
		 * 属性change回调
		 * @param e
		 * @private
		 */
		_doAttrChange : function (e) {
			var self = this;
			S.each(e.attrName, function (attr, index) {
				var value = e.newVal[index];
				switch (attr) {
				case 'initWidth':
					self.theSelection.set('w', value);
					break;
				case 'initHeight':
					self.theSelection.set('h', value);
					break;
				case 'initialXY':
					self.theSelection.set('x', value[0]);
					self.theSelection.set('y', value[1]);
					break;
				case 'borderColor':
				case 'maskColor':
				case 'maskOpacity':
				case 'cubesColor':
				case 'resizable':
				case 'minWidth':
				case 'minHeight':
				case 'ratio':
					self.theSelection.set(attr, value);
					break;
				}
			});
		},
		/**
		 * 创建预览窗口对象
		 * @private
		 */
		_createPreview : function () {
			var self = this;
			//不需预览
			if (!S.one(self.get('previewEl')))
				return;
			self.preview = new Preview({
					image : self.image,
					previewEl : self.get('previewEl'),
					viewHeight : self.get('viewHeight'),
					viewWidth : self.get('viewWidth')
				});
			self.on("imgload resize drag", function () {
				var Coords = self.getCropCoords();
				self.preview.draw(Coords.x, Coords.y, Coords.w, Coords.h, Coords.r);
			});
		},
		/**
		 * 创建拖放窗口对象
		 * @private
		 */
		_createSelection : function () {
			var self = this;
			self.theSelection = new Selection({
					x : self.get('initialXY')[0],
					y : self.get('initialXY')[1],
					w : self.get('initWidth'),
					h : self.get('initHeight'),
					minWidth : self.get('minWidth'),
					minHeight : self.get('minHeight'),
					resizable : self.get('resizable'),
					borderColor : self.get('borderColor'),
					cubesColor : self.get('cubesColor'),
					maskColor : self.get('maskColor'),
					maskOpacity : self.get('maskOpacity'),
					constraint : [self.canvasW, self.canvasH],
					ratio : self.get("ratio")
				});
			self.theSelection.on("*Change", function () {
				self._drawScene();
			});
			self.theSelection.on("resize", function (e) {
				self.fire(self.event.RESIZE, e);
			});
			self.theSelection.on("startresize", function (e) {
				self.fire(self.event.START_RESIZE, e);
			});
			self.theSelection.on("endresize", function (e) {
				self.fire(self.event.END_RESIZE, e);
			});
			self.theSelection.on("drag", function (e) {
				self.fire(self.event.DRAG, e);
			});
			self.theSelection.on("startdrag", function (e) {
				self.fire(self.event.START_DRAG, e);
			});
			self.theSelection.on("enddrag", function (e) {
				self.fire(self.event.END_DRAG, e);
			});
		},
		/**
		 * 样式初始化
		 * @private
		 */
		_build : function () {
			var self = this;
			var areaWidth = self.get('areaWidth');
			var areaHeight = self.get('areaHeight');
			self.container.css({
				position : "relative",
				width : areaWidth || self.container.width(),
				height : areaHeight || self.container.height()
			});
			/**
			 * 解决拖拽时鼠标形状问题
			 */
			self.canvas.on("selectstart mousedown", _doPreventDefault);
			function _doPreventDefault(e) {
				e.preventDefault();
				return false;
			}

			self.container.html('').append(self.canvas.css({
					position : 'absolute'
				}));
		},
		/**
		 * 绘制画布
		 * @private
		 */
		_drawScene : function () {
			this.theSelection.draw(this.ctx, this.image);
		},
		/**
		 * 鼠标hover回调
		 * @param e
		 * @private
		 */
		_handleHover : function (e) {
			var self = this;
			var canvasOffset = self.canvas.offset();
			var iMouseX = e.pageX - canvasOffset.left;
			var iMouseY = e.pageY - canvasOffset.top;
			var code = self.theSelection.registerPointPos(iMouseX, iMouseY);
			self.theSelection.hoverByCode(code);
			self._drawScene();
		},
		/**
		 * 鼠标移动回调
		 * @param e
		 * @private
		 */
		_handleMouseMove : function (e) {
			var self = this;
			//清除选择
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
			var canvasOffset = self.canvas.offset();
			var iMouseX = Math.min(Math.max(e.pageX - canvasOffset.left, 0), self.canvasW);
			var iMouseY = Math.min(Math.max(e.pageY - canvasOffset.top, 0), self.canvasH);
			// in case of drag of whole selector
			if (self.theSelection.canMove()) {
				self.theSelection.move(iMouseX - self.iMouseX, iMouseY - self.iMouseY);
			}
			// in case of dragging of resize cubes
			if (self.get('resizable') && self.theSelection.canResize()) {
				self.theSelection.resize(iMouseX, iMouseY);
			}
			self._drawScene();
		},
		/**
		 * 鼠标mousedown回调
		 * @param e
		 * @private
		 */
		_handleMouseDown : function (e) {
			var self = this;
			var theSelection = self.theSelection;
			var canvasOffset = self.canvas.offset();
			var iMouseX = self.iMouseX = e.pageX - canvasOffset.left;
			var iMouseY = self.iMouseY = e.pageY - canvasOffset.top;
			//缓存坐标，move时需要
			theSelection.set({
				px : theSelection.get('x'),
				py : theSelection.get('y'),
				pw : theSelection.get('w'),
				ph : theSelection.get('h')
			}, {
				silent : true
			});

			var code = theSelection.registerPointPos(iMouseX, iMouseY);
			theSelection.markByCode(code);
			$(document).on('mousemove', self._handleMouseMove, self);
		},
		/**
		 * 鼠标抬起回调
		 * @param e
		 * @private
		 */
		_handleMouseUp : function (e) {
			var self = this;
			self.theSelection.reset();
			$(document).detach('mousemove', self._handleMouseMove, self);
			self.fire(self.event.END_DRAG, e);
			self.fire(self.event.END_RESIZE, e);
		},
		/*******************************移动设备支持 START*********************************/
		/**
		 * 绑定touch and pinch事件
		 * @private
		 */
		_bindTouch : function () {
			var self = this;
			self._unBindTouch();
			self.canvas.on('touchstart', self._handleTouchStart, self);
			self.canvas.on('touchmove', self._handleTouchMove, self);
			self.canvas.on('touchend', self._handleTouchEnd, self);
			self.canvas.on('pinchStart', self._handlePinchStart, self);
			self.canvas.on('pinch', self._handlePinch, self);
			self.canvas.on('pinchEnd', self._handlePinchEnd, self);
		},
		/**
		 * 绑定touch and pinch事件
		 * @private
		 */
		_unBindTouch : function () {
			var self = this;
			self.canvas.detach('touchstart', self._handleTouchStart, self);
			self.canvas.detach('touchmove', self._handleTouchMove, self);
			self.canvas.detach('touchend', self._handleTouchEnd, self);
			self.canvas.detach('pinchStart', self._handlePinchStart, self);
			self.canvas.detach('pinch', self._handlePinch, self);
			self.canvas.detach('pinchEnd', self._handlePinchEnd, self);
		},
		/**
		 * TouchStart回调
		 * @param e
		 * @private
		 */
		_handleTouchStart : function (e) {
			var self = this;
			var touch = e.targetTouches[0];
			var theSelection = self.theSelection;
			var canvasOffset = self.canvas.offset();
			var iMouseX = self.iMouseX = touch.pageX - canvasOffset.left;
			var iMouseY = self.iMouseY = touch.pageY - canvasOffset.top;
			//缓存坐标，move时需要
			theSelection.set({
				px : theSelection.get('x'),
				py : theSelection.get('y'),
				pw : theSelection.get('w'),
				ph : theSelection.get('h')
			});
			var code = theSelection.registerPointPos(iMouseX, iMouseY);
			theSelection.markByCode(code);
			self.fire(self.event.START_TOUCH, e);
		},
		/**
		 * TouchMove回调
		 * @param e
		 * @private
		 */
		_handleTouchMove : function (e) {
			var self = this;
			if (e.targetTouches.length == 1) {
				e.preventDefault(); // 阻止浏览器默认事件，重要
				var touch = e.targetTouches[0];
				var canvasOffset = self.canvas.offset();
				var iMouseX = Math.min(Math.max(touch.pageX - canvasOffset.left, 0), self.canvasW);
				var iMouseY = Math.min(Math.max(touch.pageY - canvasOffset.top, 0), self.canvasH);
				// in case of drag of whole selector
				if (self.theSelection.canMove()) {
					self.theSelection.move(iMouseX - self.iMouseX, iMouseY - self.iMouseY);
				}
				// in case of dragging of resize cubes
				if (self.get('resizable') && self.theSelection.canResize()) {
					self.theSelection.resize(iMouseX, iMouseY);
				}
				self._drawScene();
				self.fire(self.event.TOUCH, e);
			}
		},
		/**
		 * TouchEnd回调
		 * @param e
		 * @private
		 */
		_handleTouchEnd : function (e) {
			this._handleMouseUp(e);
			this.fire(self.event.END_TOUCH, e);
		},
		/**
		 * PinchStart回调
		 * @param e
		 * @private
		 */
		_handlePinchStart : function (e) {
			this.pinchScale = e.scale;
			this.cropCoords = this.getCropCoords();
			this.fire(self.event.START_PINCH, e);
		},
		/**
		 * Pinch回调
		 * @param e
		 * @private
		 */
		_handlePinch : function (e) {
			var self = this;
			var scale = e.scale;
			//固定比例
			var maxW = self.canvasW;
			var maxH = self.canvasH;
			if (self.get("ratio")) {
				var r = self.cropCoords.w / self.cropCoords.h;
				if (maxW / maxH < r) {
					maxH = maxW / r;
				} else {
					maxW = maxH * r;
				}
			}
			if (self.cropCoords.w * scale >= self.get('minWidth') &&
				self.cropCoords.h * scale >= self.get('minHeight')) {
				self.setCropCoords(
					Math.max(self.cropCoords.x - (self.cropCoords.w * (scale - 1) / 2), 0),
					Math.max(self.cropCoords.y - (self.cropCoords.h * (scale - 1) / 2), 0),
					Math.min(self.cropCoords.w * scale, maxW),
					Math.min(self.cropCoords.h * scale, maxH));
			}
			self.fire(self.event.PINCH, e);
		},
		/**
		 * PinchEnd回调
		 * @param e
		 * @private
		 */
		_handlePinchEnd : function (e) {
			this.pinchScale = null;
			this.cropCoords = null;
			this.fire(self.event.END_TOUCH, e);
		},
		/*******************************移动设备支持 END*********************************/
		/**
		 * 调整图片尺寸
		 * @param imgW 图片原始宽度
		 * @param imgH 图片原始高度
		 * @param conW 容器宽度
		 * @param conH 容器高度
		 * @private
		 */
		_rejustSize : function (imgW, imgH, conW, conH) {
			var self = this,
			new_width,
			new_height;
			if ((imgW / conW) > (imgH / conH)) {
				new_width = Math.min(conW, imgW);
				new_height = new_width * imgH / imgW;
			} else {
				new_height = Math.min(conH, imgH);
				new_width = new_height * imgW / imgH;
			}
			self.canvas[0].width = self.canvasW = Math.floor(new_width);
			self.canvas[0].height = self.canvasH = Math.floor(new_height);
			self.canvas.css({
				top : (self.container.height() - self.canvasH) / 2,
				left : (self.container.width() - self.canvasW) / 2
			});
		},
		/**
		 * 渲染
		 */
		render : function () {
			this._init();
		},
		/**
		 * 重新初始化
		 */
		reset : function () {
			this._init();
		},
		/**
		 * 销毁
		 */
		destroy : function () {
			this._unBind();
			this.canvas.remove();
			this.theSelection = null;
			if (this.preview) {
				this.preview.destroy();
			}
		},
		/**
		 * 重新设置选取的位置大小
		 * @param x
		 * @param y
		 * @param w
		 * @param h
		 */
		setCropCoords : function (x, y, w, h) {
			this.set({
				initialXY : [x, y],
				initWidth : w,
				initHeight : h
			});
		},
		/**
		 * The top, left, height, width and image url of the image being cropped
		 * @return {*}
		 */
		getCropCoords : function () {
			return S.merge(this.theSelection.getInfo(), {
				url : this.get('url'),
				r : this.image.width / this.canvasW
			});
		},
		/**
		 * 图片的原始尺寸
		 * @return {Object}
		 */
		getOriginalSize : function () {
			return {
				width : this.image.width,
				height : this.image.height
			};
		},
		/**
		 * 图片现在显示的尺寸
		 * @return {Object}
		 */
		getDisplaySize : function () {
			return {
				width : this.canvasW,
				height : this.canvasH
			};
		},
		/**
		 * 截取信息的字符串形式
		 * @param space
		 * @return {*}
		 */
		toString : function (space) {
			return S.JSON.stringify(this.getCropCoords(), null, space || 0);
		}
	});
	return ImgCrop;
}, {
	attach : false,
	requires : ['./preview', './selection']
});

/**
 * resize组件
 */
KISSY.add('gallery/imgcrop/2.1/type/normal/resizable',function (S) {
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
                    Right:".cubes-t",
                    Left:".cubes-t",
                    Up:".cubes-t",
                    Down:".cubes-t",
                    RightDown:".cubes-rb",
                    LeftDown:".cubes-lb",
                    RightUp:".cubes-rt",
                    LeftUp:".cubes-lt"
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


/**
 *拖拽组件
 */
KISSY.add('gallery/imgcrop/2.1/type/normal/dragable',function (S) {
	var Event = S.Event,
	DOM = S.DOM,
	ie = S.UA.ie;
	//拖放程序
	function Drag() {
		this.initialize.apply(this, arguments);
	}

	S.augment(Drag, {
		//拖放对象
		initialize : function (drag, options) {
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
		setOptions : function (options) {
			this.options = { //默认值
				Handle : "", //设置触发对象（不设置则使用拖放对象）
				Limit : true, //是否设置范围限制(为true时下面参数有用,可以是负数)
				mxLeft : 0, //左边限制
				mxRight : 9999, //右边限制
				mxTop : 0, //上边限制
				mxBottom : 9999, //下边限制
				mxContainer : "", //指定限制在容器内
				LockX : false, //是否锁定水平方向拖放
				LockY : false, //是否锁定垂直方向拖放
				Lock : false, //是否锁定
				Transparent : true, //是否透明
				onstart : function () {}, //开始移动时执行
				onmove : function () {}, //移动时执行
				onstop : function () {}
				//结束移动时执行
			};
			S.mix(this.options, options);
		},
		//准备拖动
		start : function (e) {
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
		stop : function (e) {
			//移除事件
			Event.detach(document, "mousemove", this.move, this);
			Event.detach(document, "mouseup", this.stop, this);
			//附加程序
			this.options.onstop(e);
		},
		//修正范围
		Repair : function () {
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
		move : function (e) {
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
}, {
	attach : false
});

/**
 * 图片剪裁组件
 * author 元泉
 * date 2013-3-31
 */
KISSY.add('gallery/imgcrop/2.1/type/normal/imgcrop',function (S, Resize, Drag) {
    var $ = S.all,
        Event = S.Event,
        DOM = S.DOM;

    function ImgCrop(option) {
        ImgCrop.superclass.constructor.apply(this, arguments);
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
        resizable:{
            value:true
        },
        ratio:{
            value:false
        },
        maskOpacity:{
            value:0.5
        },
        maskColor:{
            value:'#000'
        },
        /**
         * 边框颜色
         */
        borderColor:{
            value:'#fff'
        },
        /**
         * 小方块颜色
         */
        cubesColor:{
            value:'#fff'
        },
        minHeight:{
            value:100
        },
        minWidth:{
            value:100
        },
        previewEl:{
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
            self._unbind();
            self.on('*Change', self._loadImage, self);
            Event.on(self._tempImg, 'load', self._onImgLoad, self);
        },
        _unbind : function(){
            var self = this;
            self.detach('*Change', self._loadImage, self);
            Event.detach(self._tempImg, 'load', self._onImgLoad, self);
        },
        _render:function () {
            var self = this;
            self.area = $(self.get('areaEl')).css('overflow', 'hidden').html('');
            self.preview = $(self.get('previewEl')).html('');
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
            if (self.get("resizable")) {
                S.each(['lt', 'rt', 'rb', 'lb', 't'], function (pos) {
                    _el.append($('<div class="cubes cubes-' + pos + '">'));
                });
                _el.all('.cubes').css({
                    'position': 'absolute',
                    'background-color': self.get('cubesColor'),
                    'width': 6,
                    'height': 6,
                    'font-size': 0,
                    'line-height': 0
                });
                _el.all(".cubes-lt").css({
                    left : -4,
                    top  : -4,
                    cursor : 'nw-resize'
                });
                _el.all(".cubes-rt").css({
                    right : -4,
                    top  : -4,
                    cursor : 'ne-resize'
                });
                _el.all(".cubes-lb").css({
                    left : -4,
                    bottom  : -4,
                    cursor : 'ne-resize'
                });
                _el.all(".cubes-rb").css({
                    right : -4,
                    bottom  : -4,
                    cursor : 'nw-resize'
                });
                _el.all(".cubes-t").hide();
            }
            _el.css({
                'position':'absolute',
                'left':self.get('initialXY')[0],
                'top':self.get('initialXY')[1],
                'width':self.get('initWidth'),
                'height':self.get('initHeight'),
                'display':'none',
                'cursor' : 'move',
                'background': "url('#')",
                'border':'1px solid '+self.get('borderColor')
            });

            return _el;
        },
        _loadImage:function () {
            var self = this;
            var imgUrl = self.get("url");
            var token = imgUrl.indexOf('?') > -1 ? '&' : '?';
            self._layBase.style.visibility = self._layCropper.style.visibility = 'hidden';
            //加载图片，为了保证每次调用都能触发load事件加一个随机数
            self._tempImg.src = self._layBase.src = self._layCropper.src = imgUrl + token + "nocache=" + S.guid();
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
            if (self.get('resizable')) {
                self._resize = new Resize(self.el, {
                    Max:true,
                    Min:true,
                    Scale:self.get("ratio"),
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
                background:self.get("maskColor")
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
                opacity:self.get("maskOpacity"),
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
            var preWrap = S.one(self.get("previewEl")); //预览对象
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
        getDisplaySize:function () {
            return this._getSize(this._tempImg.width, this._tempImg.height, this.get("areaWidth"), this.get("areaHeight"));
        },
        /**
         * 原始图片的尺寸
         * @return {Object}
         */
        getOriginalSize:function () {
            return {
                width:parseInt(this._tempImg.width, 10),
                height:parseInt(this._tempImg.height, 10)
            };
        },
        /**
         * 剪裁区域图片信息
         * @return {Object}
         */
        getCropCoords:function () {
            var info = this._getPos();
            var r = parseInt(this._tempImg.width, 10) / parseInt(this._layBase.width, 10);
            var result = {
                y:info.y,
                x:info.x,
                w:info.w,
                h:info.h,
                r:r,
                url:this.get("url")
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
        setCropCoords:function (x, y, w, h) {
            this.el.css({
                width:w,
                height:h,
                top:y,
                left:x
            });
            this._setPos();
        },
        render : function(){
            this._init();
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
        },
        reset:function () {
            this._init();
        },
        toString:function () {
            return S.JSON.stringify(this.getCropCoords());
        }
    });
    return ImgCrop;
}, {
    attach:false,
    requires:[
        './resizable',
        './dragable'
    ]
});

/**
 * 图片剪裁组件
 * author 元泉
 * date 2013-5-4
 */
KISSY.add('gallery/imgcrop/2.1/index',function (S, ImgCropCanvas, ImgCropNormal) {
    return 'getContext' in document.createElement('canvas') ? ImgCropCanvas : ImgCropNormal;
}, {
    requires: [
        './type/html5/imgcrop',
        './type/normal/imgcrop'
    ]
});

