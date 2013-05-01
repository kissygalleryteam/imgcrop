/*
 * 图像剪裁组件
 * 基于canvas
 */
KISSY.add(function (S) {
	var $ = S.all;

	// define Selection constructor
	function Selection(x, y, w, h) {
		this.x = x; // initial positions
		this.y = y;
		this.w = w; // and size
		this.h = h;

		this.px = 0; // extra variables to dragging calculations
		this.py = 0;

		this.csize = 5; // resize cubes size
		this.csizeh = 6; // resize cubes size (on hover)

		this.bHover = [false, false, false, false]; // hover statuses
		this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
		this.bDrag = [false, false, false, false]; // drag statuses
		this.bDragAll = false; // drag whole selection
	}
	S.augment(Selection, {
		draw : function (ctx) {
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 1;
			ctx.strokeRect(this.x, this.y, this.w, this.h);

			// draw resize cubes
			ctx.fillStyle = '#fff';
			ctx.fillRect(this.x - this.iCSize[0], this.y - this.iCSize[0], this.iCSize[0] * 2, this.iCSize[0] * 2);
			ctx.fillRect(this.x + this.w - this.iCSize[1], this.y - this.iCSize[1], this.iCSize[1] * 2, this.iCSize[1] * 2);
			ctx.fillRect(this.x + this.w - this.iCSize[2], this.y + this.h - this.iCSize[2], this.iCSize[2] * 2, this.iCSize[2] * 2);
			ctx.fillRect(this.x - this.iCSize[3], this.y + this.h - this.iCSize[3], this.iCSize[3] * 2, this.iCSize[3] * 2);
		},
		getInfo : function () {
			return {
				x : this.x,
				y : this.y,
				w : this.w,
				h : this.h
			}
		}
	});

	function ImgCrop() {
		ImgCrop.superclass.constructor.apply(this, arguments);
		this.container = $(this.get('areaEl'));
		this.canvas = $('<canvas>');
		this.ctx = this.canvas[0].getContext('2d');
		this.image = new Image();
		this.iMouseX = 0;
		this.iMouseY = 0;
		this.theSelection = null;
		this._init();
	}
	ImgCrop.ATTRS = {
		areaEl : {
			value : ''
		},
		areaWidth : {
			value : 0
		},
		areaHeight : {
			value : 0
		},
		url : {
			value : ''
		},
		initWidth : {
			value : 100
		},
		initHeight : {
			value : 100
		},
		resize : {
			value : true
		},
		scale : {
			value : false
		},
		opacity : {
			value : 50
		},
		color : {
			value : '#000'
		},
		min : {
			value : false
		},
		minHeight : {
			value : 100
		},
		minWidth : {
			value : 100
		},
		preview : {
			value : ''
		},
		viewHeight : {
			value : 300
		},
		viewWidth : {
			value : 300
		},
		initialXY : {
			value : [50, 50]
		}
	};
	S.extend(ImgCrop, S.Base);
	S.augment(ImgCrop, S.EventTarget, {
		_init : function () {
			var self = this;
			var image = self.image;
			image.onload = function () {
				self._build();
				self.theSelection = new Selection(self.get('initialXY')[0], self.get('initialXY')[1], self.get('initWidth'), self.get('initHeight'));
				self._rejustSize(image.width, image.height, self.container.width(), self.container.height());
				self._drawScene();
				self._bind();
				self.fire('imgload', {
					width : image.width,
					height : image.height
				});
			}
			image.src = self.get('url');
		},
		_bind : function () {
			$(document).on('mousemove', this._handleMouseMove, this);
			this.canvas.on('mousedown', this._handleMouseDown, this);
			$(document).on('mouseup', this._handleMouseUp, this);
		},
		_build : function () {
			var self = this;
			var areaWidth = self.get('areaWidth');
			var areaHeight = self.get('areaHeight');

			self.container.css({
				position : "relative",
				width : areaWidth || self.container.width(),
				height : areaHeight || self.container.height()
			});

			//init canvas temp size
			self.canvas.css({
				position : 'absolute'
			});

			self.container.append(self.canvas);
		},
		_drawScene : function () {
			var self = this;
			var ctx = self.ctx;
			var width = self.canvasW;
			var height = self.canvasH;
			var theSelection = self.theSelection;
			ctx.clearRect(0, 0, width, height); // clear canvas
			// draw source image
			ctx.drawImage(self.image, 0, 0, width, height);

			// and make it darker
			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.fillRect(0, 0, width, theSelection.y);
			ctx.fillRect(0, theSelection.y, theSelection.x, theSelection.h);
			ctx.fillRect(theSelection.x + theSelection.w, theSelection.y, width - theSelection.x - theSelection.w, theSelection.h);
			ctx.fillRect(0, theSelection.y + theSelection.h, width, height - theSelection.y - theSelection.h);

			// draw selection
			theSelection.draw(ctx);
		},

		_handleMouseMove : function (e) {
			var self = this;
			e.preventDefault();
			//清除选择
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();

			var iMouseX = self.iMouseX;
			var iMouseY = self.iMouseY;
			var theSelection = self.theSelection;
			var canvasOffset = self.canvas.offset();
			iMouseX = Math.min(Math.max(e.pageX - canvasOffset.left, 0), self.canvasW);
			iMouseY = Math.min(Math.max(e.pageY - canvasOffset.top, 0), self.canvasH);

			// in case of drag of whole selector
			if (theSelection.bDragAll) {
				self.fire("drag", {
					e : e
				});
				theSelection.x = Math.min(Math.max(iMouseX - theSelection.px, 0), self.canvasW - theSelection.w);
				theSelection.y = Math.min(Math.max(iMouseY - theSelection.py, 0), self.canvasH - theSelection.h);
			}

			//reset cubes
			for (i = 0; i < 4; i++) {
				theSelection.bHover[i] = false;
				theSelection.iCSize[i] = theSelection.csize;
			}

			// hovering over resize cubes
			if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
				iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

				theSelection.bHover[0] = true;
				theSelection.iCSize[0] = theSelection.csizeh;
			}
			if (iMouseX > theSelection.x + theSelection.w - theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
				iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

				theSelection.bHover[1] = true;
				theSelection.iCSize[1] = theSelection.csizeh;
			}
			if (iMouseX > theSelection.x + theSelection.w - theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
				iMouseY > theSelection.y + theSelection.h - theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

				theSelection.bHover[2] = true;
				theSelection.iCSize[2] = theSelection.csizeh;
			}
			if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
				iMouseY > theSelection.y + theSelection.h - theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

				theSelection.bHover[3] = true;
				theSelection.iCSize[3] = theSelection.csizeh;
			}

			// in case of dragging of resize cubes
			var iFW,
			iFH,
			iFX,
			iFY;
			if (theSelection.bDrag[0]) {
				iFX = iMouseX - theSelection.px;
				iFY = iMouseY - theSelection.py;
				iFW = theSelection.w + theSelection.x - iFX;
				iFH = theSelection.h + theSelection.y - iFY;
				self.fire("resize", {
					e : e
				});
			}
			if (theSelection.bDrag[1]) {
				iFX = theSelection.x;
				iFY = iMouseY - theSelection.py;
				iFW = iMouseX - theSelection.px - iFX;
				iFH = theSelection.h + theSelection.y - iFY;
				self.fire("resize", {
					e : e
				});
			}
			if (theSelection.bDrag[2]) {
				iFX = theSelection.x;
				iFY = theSelection.y;
				iFW = iMouseX - theSelection.px - iFX;
				iFH = iMouseY - theSelection.py - iFY;
				self.fire("resize", {
					e : e
				});
			}
			if (theSelection.bDrag[3]) {
				iFX = iMouseX - theSelection.px;
				iFY = theSelection.y;
				iFW = theSelection.w + theSelection.x - iFX;
				iFH = iMouseY - theSelection.py - iFY;
				self.fire("resize", {
					e : e
				});
			}

			//min
			if (iFW > self.get('minWidth')) {
				theSelection.w = iFW;
				theSelection.x = iFX;
			}
			if (iFH > self.get('minHeight')) {
				theSelection.h = iFH;
				theSelection.y = iFY;
			}

			self._drawScene();
		},
		_handleMouseDown : function (e) {
			var self = this;
			var iMouseX = self.iMouseX;
			var iMouseY = self.iMouseY;
			var theSelection = self.theSelection;
			var canvasOffset = self.canvas.offset();
			iMouseX = Math.floor(e.pageX - canvasOffset.left);
			iMouseY = Math.floor(e.pageY - canvasOffset.top);

			theSelection.px = iMouseX - theSelection.x;
			theSelection.py = iMouseY - theSelection.y;

			if (theSelection.bHover[0]) {
				theSelection.px = iMouseX - theSelection.x;
				theSelection.py = iMouseY - theSelection.y;
			}
			if (theSelection.bHover[1]) {
				theSelection.px = iMouseX - theSelection.x - theSelection.w;
				theSelection.py = iMouseY - theSelection.y;
			}
			if (theSelection.bHover[2]) {
				theSelection.px = iMouseX - theSelection.x - theSelection.w;
				theSelection.py = iMouseY - theSelection.y - theSelection.h;
			}
			if (theSelection.bHover[3]) {
				theSelection.px = iMouseX - theSelection.x;
				theSelection.py = iMouseY - theSelection.y - theSelection.h;
			}

			if (iMouseX > theSelection.x + theSelection.csizeh && iMouseX < theSelection.x + theSelection.w - theSelection.csizeh &&
				iMouseY > theSelection.y + theSelection.csizeh && iMouseY < theSelection.y + theSelection.h - theSelection.csizeh) {

				theSelection.bDragAll = true;
			}

			for (i = 0; i < 4; i++) {
				if (theSelection.bHover[i]) {
					theSelection.bDrag[i] = true;
				}
			}
		},
		_handleMouseUp : function (e) {
			var theSelection = this.theSelection;
			theSelection.bDragAll = false;
			for (i = 0; i < 4; i++) {
				theSelection.bDrag[i] = false;
			}
			theSelection.px = 0;
			theSelection.py = 0;
		},
		_rejustSize : function (imgW, imgH, conW, conH) {
			var self = this;
			var new_width,
			new_height;
			if ((imgW / conW) > (imgH / conH)) {
				new_width = Math.min(conW, imgW);
				new_height = new_width * imgH / imgW;
			} else {
				new_height = Math.min(conH, imgH);
				new_width = new_height * imgW / imgH;
			}

			self.canvas[0].width = self.canvasW = new_width;
			self.canvas[0].height = self.canvasH = new_height;

			self.canvas.css({
				top : (self.container.height() - self.canvasH) / 2,
				left : (self.container.width() - self.canvasW) / 2,
			});
		},
		getInfo : function () {
			return this.theSelection.getInfo();
		},
		move : function (diffX, diffY) {}
	});
	return ImgCrop;
});
