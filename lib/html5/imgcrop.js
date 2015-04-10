/**
 * @ImgCrop 图像剪裁组件，基于canvas
 * @author 元泉 2013-5-8
 */
'use strict';
var Preview = require('./preview');
var Selection = require('./selection');
var Base = require('base');
var Node = require('node');
var $ = Node.all;

/**
 * 剪裁对象
 * @constructor
 */

module.exports = Base.extend({
  initializer: function() {
    this.canvas = $('<canvas>');
    this.ctx = this.canvas[0].getContext('2d');
    this.image = new Image();
  },
  /**
   * 支持的事件列表
   */
  event: {
    DRAG: "drag",
    START_DRAG: "startdrag",
    END_DRAG: "enddrag",
    RESIZE: "resize",
    START_RESIZE: "startresize",
    END_RESIZE: "endresize",
    TOUCH: "touch",
    START_TOUCH: "starttouch",
    END_TOUCH: "endtouch",
    PINCH: "pinch",
    START_PINCH: "startpinch",
    END_PINCH: "endpinch",
    IMGLOAD: "imgload"
  },
  /**
   * 初始化
   * @private
   */
  _init: function() {
    var self = this;
    // 该操作从构造函数迁移到init中，在构造函数中的话，如果areaEl新赋值会出问题
    self.container = $(self.get('areaEl'));
    // console.log(self.get('areaEl'));
    var image = self.image;
    image.onload = function() {
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
  _bind: function() {
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
  _unBind: function() {
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
  _doAttrChange: function(e) {
    var self = this;
    S.each(e.attrName, function(attr, index) {
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
  _createPreview: function() {
    var self = this;
    //不需预览
    if (!S.one(self.get('previewEl')))
      return;
    self.preview = new Preview({
      image: self.image,
      previewEl: self.get('previewEl'),
      viewHeight: self.get('viewHeight'),
      viewWidth: self.get('viewWidth')
    });
    self.on("imgload resize drag", function() {
      var Coords = self.getCropCoords();
      self.preview.draw(Coords.x, Coords.y, Coords.w, Coords.h, Coords.r);
    });
  },
  /**
   * 创建拖放窗口对象
   * @private
   */
  _createSelection: function() {
    var self = this;
    self.theSelection = new Selection({
      x: self.get('initialXY')[0],
      y: self.get('initialXY')[1],
      w: self.get('initWidth'),
      h: self.get('initHeight'),
      minWidth: self.get('minWidth'),
      minHeight: self.get('minHeight'),
      resizable: self.get('resizable'),
      borderColor: self.get('borderColor'),
      cubesColor: self.get('cubesColor'),
      maskColor: self.get('maskColor'),
      maskOpacity: self.get('maskOpacity'),
      constraint: [self.canvasW, self.canvasH],
      ratio: self.get("ratio")
    });
    self.theSelection.on("*Change", function() {
      self._drawScene();
    });
    self.theSelection.on("resize", function(e) {
      self.fire(self.event.RESIZE, e);
    });
    self.theSelection.on("startresize", function(e) {
      self.fire(self.event.START_RESIZE, e);
    });
    self.theSelection.on("endresize", function(e) {
      self.fire(self.event.END_RESIZE, e);
    });
    self.theSelection.on("drag", function(e) {
      self.fire(self.event.DRAG, e);
    });
    self.theSelection.on("startdrag", function(e) {
      self.fire(self.event.START_DRAG, e);
    });
    self.theSelection.on("enddrag", function(e) {
      self.fire(self.event.END_DRAG, e);
    });
  },
  /**
   * 样式初始化
   * @private
   */
  _build: function() {
    var self = this;
    var areaWidth = self.get('areaWidth');
    var areaHeight = self.get('areaHeight');
    self.container.css({
      position: "relative",
      width: areaWidth || self.container.width(),
      height: areaHeight || self.container.height()
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
      position: 'absolute'
    }));
  },
  /**
   * 绘制画布
   * @private
   */
  _drawScene: function() {
    this.theSelection.draw(this.ctx, this.image);
  },
  /**
   * 鼠标hover回调
   * @param e
   * @private
   */
  _handleHover: function(e) {
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
  _handleMouseMove: function(e) {
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
  _handleMouseDown: function(e) {
    var self = this;
    var theSelection = self.theSelection;
    var canvasOffset = self.canvas.offset();
    var iMouseX = self.iMouseX = e.pageX - canvasOffset.left;
    var iMouseY = self.iMouseY = e.pageY - canvasOffset.top;
    //缓存坐标，move时需要
    theSelection.set({
      px: theSelection.get('x'),
      py: theSelection.get('y'),
      pw: theSelection.get('w'),
      ph: theSelection.get('h')
    }, {
      silent: true
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
  _handleMouseUp: function(e) {
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
  _bindTouch: function() {
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
  _unBindTouch: function() {
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
  _handleTouchStart: function(e) {
    var self = this;
    var touch = e.targetTouches[0];
    var theSelection = self.theSelection;
    var canvasOffset = self.canvas.offset();
    var iMouseX = self.iMouseX = touch.pageX - canvasOffset.left;
    var iMouseY = self.iMouseY = touch.pageY - canvasOffset.top;
    //缓存坐标，move时需要
    theSelection.set({
      px: theSelection.get('x'),
      py: theSelection.get('y'),
      pw: theSelection.get('w'),
      ph: theSelection.get('h')
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
  _handleTouchMove: function(e) {
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
  _handleTouchEnd: function(e) {
    this._handleMouseUp(e);
    this.fire(self.event.END_TOUCH, e);
  },
  /**
   * PinchStart回调
   * @param e
   * @private
   */
  _handlePinchStart: function(e) {
    this.pinchScale = e.scale;
    this.cropCoords = this.getCropCoords();
    this.fire(self.event.START_PINCH, e);
  },
  /**
   * Pinch回调
   * @param e
   * @private
   */
  _handlePinch: function(e) {
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
  _handlePinchEnd: function(e) {
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
  _rejustSize: function(imgW, imgH, conW, conH) {
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
      top: Math.floor((self.container.height() - self.canvasH) / 2),
      left: Math.floor((self.container.width() - self.canvasW) / 2)
    });
  },
  /**
   * 渲染
   */
  render: function() {
    this._init();
  },
  /**
   * 重新初始化
   */
  reset: function() {
    this._init();
  },
  /**
   * 销毁
   */
  destroy: function() {
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
  setCropCoords: function(x, y, w, h) {
    x = parseInt(x);
    y = parseInt(y);
    w = parseInt(w);
    h = parseInt(h);
    this.set({
      initialXY: [x, y],
      initWidth: w,
      initHeight: h
    });
  },
  /**
   * The top, left, height, width and image url of the image being cropped
   * @return {*}
   */
  getCropCoords: function() {
    return S.merge(this.theSelection.getInfo(), {
      url: this.get('url'),
      r: this.image.width / this.canvasW
    });
  },
  /**
   * 图片的原始尺寸
   * @return {Object}
   */
  getOriginalSize: function() {
    return {
      width: this.image.width,
      height: this.image.height
    };
  },
  /**
   * 图片现在显示的尺寸
   * @return {Object}
   */
  getDisplaySize: function() {
    return {
      width: this.canvasW,
      height: this.canvasH
    };
  },
  /**
   * 截取信息的字符串形式
   * @param space
   * @return {*}
   */
  toString: function(space) {
    return JSON.stringify(this.getCropCoords(), null, space || 0);
  }
}, {
  ATTRS: {
    /**
     * 图像的容器{HTMLElement | NodeList | Selector}
     */
    areaEl: {
      value: ''
    },
    /**
     * 容器宽度，默认从容器的样式中获得
     */
    areaWidth: {
      value: 0
    },
    /**
     * 容器高度，默认从容器的样式中获得
     */
    areaHeight: {
      value: 0
    },
    /**
     * 图片的地址
     */
    url: {
      value: ''
    },
    /**
     * 视窗的默认宽度
     */
    initWidth: {
      value: 100
    },
    /**
     * 视窗的默认高度
     */
    initHeight: {
      value: 100
    },
    /**
     * 是否可以缩放
     */
    resizable: {
      value: true
    },
    /**
     * 是否固定比例
     */
    ratio: {
      value: false
    },
    /**
     * 视窗的最小高度
     */
    minHeight: {
      value: 10
    },
    /**
     * 视窗的最小宽度
     */
    minWidth: {
      value: 10
    },
    /**
     * 初始坐标
     */
    initialXY: {
      value: [50, 50]
    },
    /**
     * 边框颜色
     */
    borderColor: {
      value: '#fff'
    },
    /**
     * 小方块颜色
     */
    cubesColor: {
      value: '#fff'
    },
    /**
     *  遮罩颜色
     */
    maskColor: {
      value: '#000'
    },
    /**
     * 遮罩透明度
     */
    maskOpacity: {
      value: '0.5'
    },
    /**
     * 预览窗口，不需要可以不配置{HTMLElement|NodeList}
     */
    previewEl: {
      value: ''
    },
    /**
     * 预览窗口高度
     */
    viewHeight: {
      value: 100
    },
    /**
     * 预览窗口宽度
     */
    viewWidth: {
      value: 100
    },
    /**
     * 是否支持touch、pinch
     */
    touchable: {
      value: true
    }
  }
});
