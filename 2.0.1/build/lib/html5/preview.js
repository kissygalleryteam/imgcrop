KISSY.add('kg/imgcrop/2.0.1/lib/html5/preview',["node","base"],function(S ,require, exports, module) {
 /**
 * @Preview 预览模块
 * @author 元泉 2013-5-4
 */
'use strict';
var Node = require('node');
var Base = require('base');
var $ = Node.all;

module.exports = Base.extend({
  initializer: function() {
    this.canvas = $('<canvas>');
    this.ctx = this.canvas[0].getContext('2d');
    this._init();
  },
  _init: function() {
    this.container = $(this.get('previewEl'));
    this._build();
  },
  _build: function() {
    var self = this;
    var viewWidth = self.get('viewWidth');
    var viewHeight = self.get('viewHeight');
    self.container.css({
      position: "relative",
      width: viewWidth || self.container.width(),
      height: viewHeight || self.container.height()
    });
    self.container.html('').append(self.canvas.css({
      position: 'absolute'
    }));

    self.canvas[0].width = self.canvasW = viewWidth;
    self.canvas[0].height = self.canvasH = viewHeight;
  },
  _rejustSize: function(imgW, imgH, conW, conH) {
    var new_width, new_height;
    if ((imgW / conW) > (imgH / conH)) {
      new_width = conW;
      new_height = new_width * imgH / imgW;
    } else {
      new_height = conH;
      new_width = new_height * imgW / imgH;
    }
    return {
      w: new_width,
      h: new_height,
      x: (conW - new_width) / 2,
      y: (conH - new_height) / 2
    };
  },
  draw: function(x, y, w, h, r) {
    var self = this;
    // clear canvas
    self.ctx.clearRect(0, 0, self.canvasW, self.canvasH);
    var oriCoords = {
      x: Math.floor(x * r),
      y: Math.floor(y * r),
      w: Math.floor(w * r),
      h: Math.floor(h * r)
    };
    var newCoords = self._rejustSize(oriCoords.w, oriCoords.h, self.canvasW, self.canvasH);
    self.ctx.drawImage(self.get('image'), oriCoords.x, oriCoords.y, oriCoords.w, oriCoords.h, newCoords.x, newCoords.y, newCoords.w, newCoords.h);
  },
  destroy: function() {
    this.canvas.remove();
  }
}, {
  ATTRS: {
    previewEl: {
      value: ''
    },
    viewHeight: {
      value: 100
    },
    viewWidth: {
      value: 100
    },
    image: {
      value: null
    }
  }
});

});