/*
 * 图像剪裁组件
 * 基于canvas
 */
KISSY.add(function (S, Preview, Selection) {
	var $ = S.all;

	function ImgCrop() {
		ImgCrop.superclass.constructor.apply(this, arguments);
		this.container = $(this.get('areaEl'));
		this.canvas = $('<canvas>');
		this.ctx = this.canvas[0].getContext('2d');
		this.image = new Image();
		this.preview = null;
		this._init();
	}
	ImgCrop.EVENT = {
		DRAG : "drag",
		START_DRAG : "startdrag",
		END_DRAG : "enddrag",
		RESIZE : "resize",
		START_RESIZE : "startresize",
		END_RESIZE : "endresize",
		IMGLOAD : "imgload"
	};
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
		resizable : {
			value : true
		},
		scale : {
			value : false
		},
		opacity : {
			value : 50
		},
		maskColor : {
			value : '#000'
		},
		minHeight : {
			value : 100
		},
		minWidth : {
			value : 100
		},
		borderColor : {
			value : '#fff'
		},
		cubesColor : {
			value : '#fff'
		},
		previewEl : {
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
				self._rejustSize(image.width, image.height, self.container.width(), self.container.height());
				self._createSelection();
				self._drawScene();
				self._bind();
				self._createPreview();
				self.fire(ImgCrop.EVENT.IMGLOAD, self.getOriginalSize());
			}
			image.src = self.get('url');
		},
		_bind : function () {
			var self = this;
			self.canvas.on('mousemove', self._handleHover, self);
			self.canvas.on('mousedown', self._handleMouseDown, self);
			$(document).on('mouseup', self._handleMouseUp, self);
			self.on("*Change", self._doAttrChange, self);

			//增加触摸事件
			self.canvas.on('touchstart', self._handleTouchStart, self);
			self.canvas.on('touchmove', self._handleTouchMove, self);
			self.canvas.on('touchend', self._handleTouchEnd, self);
			self.canvas.on('pinchStart', self._handlePinchStart, self);
			self.canvas.on('pinch', self._handlePinch, self);
			self.canvas.on('pinchEnd', self._handlePinchEnd, self);
		},
		_unBind : function () {
			var self = this;
			$(document).detach('mousemove', self._handleMouseMove, self);
			self.canvas.detach('mousedown', self._handleMouseDown, self);
			$(document).detach('mouseup', self._handleMouseUp, self);
			self.detach("*Change", self._doAttrChange, self);
		},
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
				case 'cubesColor':
				case 'resizable':
				case 'minWidth':
				case 'minHeight':
					self.theSelection.set(attr, value);
					break;
				default:
					self.reset();
				}
			});

		},
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
					constraint : [self.canvasW, self.canvasH]
				});

			self.theSelection.on("*Change", function(){
				self._drawScene();
			});
			self.theSelection.on("resize", function(){
				self.fire(ImgCrop.EVENT.RESIZE);
			});
			self.theSelection.on("startresize", function(){
				self.fire(ImgCrop.EVENT.START_RESIZE);
			});
			self.theSelection.on("endresize", function(){
				self.fire(ImgCrop.EVENT.END_RESIZE);
			});
			self.theSelection.on("drag", function(){
				self.fire(ImgCrop.EVENT.DRAG);
			});
			self.theSelection.on("startdrag", function(){
				self.fire(ImgCrop.EVENT.START_DRAG);
			});
			self.theSelection.on("enddrag", function(){
				self.fire(ImgCrop.EVENT.END_DRAG);
			});
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

			self.canvas.detach("selectstart mousedown", _doPreventDefault).on("selectstart mousedown", _doPreventDefault);

			function _doPreventDefault(e) {
				e.preventDefault();
				return false;
			}

			self.container.html('').append(self.canvas.css({
					position : 'absolute'
				}));
		},
		_drawScene : function () {
			var self = this;
			var selection = {
				x : self.theSelection.get('x'),
				y : self.theSelection.get('y'),
				w : self.theSelection.get('w'),
				h : self.theSelection.get('h')
			};
			var ctx = self.ctx;
			// clear canvas
			ctx.clearRect(0, 0, self.canvasW, self.canvasH);
			// draw source image
			ctx.drawImage(self.image, 0, 0, self.canvasW, self.canvasH);

			// and make it darker
			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.fillRect(0, 0, self.canvasW, selection.y);
			ctx.fillRect(0, selection.y, selection.x, selection.h);
			ctx.fillRect(selection.x + selection.w, selection.y, self.canvasW - selection.x - selection.w, selection.h);
			ctx.fillRect(0, selection.y + selection.h, self.canvasW, self.canvasH - selection.y - selection.h);

			// draw selection
			self.theSelection.draw(ctx);
		},

		_handleHover : function(e){
			var self = this;
			var canvasOffset = self.canvas.offset();
			var iMouseX = e.pageX - canvasOffset.left;
			var iMouseY = e.pageY - canvasOffset.top;
			var code = self.theSelection.registerPointPos(iMouseX, iMouseY);
			self.theSelection.hoverByCode(code);
			
			self._drawScene();
		},

		_handleMouseMove : function (e) {
			var self = this;
			//清除选择
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();

			var canvasOffset = self.canvas.offset();
			var iMouseX = Math.min(Math.max(e.pageX - canvasOffset.left, 0), self.canvasW);
			var iMouseY = Math.min(Math.max(e.pageY - canvasOffset.top, 0), self.canvasH);

			// in case of drag of whole selector
			if(self.theSelection.canMove()){
				self.theSelection.move(iMouseX - self.iMouseX, iMouseY - self.iMouseY);
			}

			// in case of dragging of resize cubes
			if(self.theSelection.canResize()){
				self.theSelection.resize(iMouseX, iMouseY);
			}
			
			self._drawScene();

		},
		_handleMouseDown : function (e) {
			var self = this;
			var theSelection = self.theSelection;
			var canvasOffset = self.canvas.offset();
			var iMouseX = self.iMouseX = e.pageX - canvasOffset.left;
			var iMouseY = self.iMouseY = e.pageY - canvasOffset.top;

			//缓存坐标，move时需要
			theSelection.set({
				px : theSelection.get('x'),
				py : theSelection.get('y')
			},{silent:true});

			var code = theSelection.registerPointPos(iMouseX, iMouseY);
			theSelection.markByCode(code);
			
			$(document).on('mousemove', self._handleMouseMove, self);
		},
		_handleMouseUp : function (e) {
			var self = this;
			self.theSelection.reset();
			$(document).detach('mousemove', self._handleMouseMove, self);
			self.fire(ImgCrop.EVENT.END_DRAG);
			self.fire(ImgCrop.EVENT.END_RESIZE);
		},
		
/*******************************移动设备支持*********************************/		

		_handleTouchStart : function (e) {
			var self = this;
			var theSelection = self.theSelection;
			var canvasOffset = self.canvas.offset();
			var iMouseX = self.iMouseX = Math.floor(e.touches[0].pageX - canvasOffset.left);
			var iMouseY = self.iMouseY = Math.floor(e.touches[0].pageY - canvasOffset.top);
			
			// hovering over resize cubes
			self.theSelection._hovering(iMouseX, iMouseY);
			
			var px, py;
			if (theSelection.bHover[0]) {
				px = iMouseX - theSelection.get('x');
				py = iMouseY - theSelection.get('y');
			} else if (theSelection.bHover[1]) {
				px = iMouseX - theSelection.get('x') - theSelection.get('w');
				py = iMouseY - theSelection.get('y');
			} else if (theSelection.bHover[2]) {
				px = iMouseX - theSelection.get('x') - theSelection.get('w');
				py = iMouseY - theSelection.get('y') - theSelection.get('h');
			} else if (theSelection.bHover[3]) {
				px = iMouseX - theSelection.get('x');
				py = iMouseY - theSelection.get('y') - theSelection.get('h');
			} else {
				px = iMouseX - theSelection.get('x');
				py = iMouseY - theSelection.get('y');
			}

			theSelection.set({
				px : px,
				py : py
			});

			if (iMouseX > theSelection.get('x') + theSelection.csize &&
				iMouseX < theSelection.get('x') + theSelection.get('w') - theSelection.csize &&
				iMouseY > theSelection.get('y') + theSelection.csize &&
				iMouseY < theSelection.get('y') + theSelection.get('h') - theSelection.csize) {

				theSelection.bDragAll = true;
			}

			self.fire(ImgCrop.EVENT.START_DRAG);
			self.fire(ImgCrop.EVENT.START_RESIZE);
		},
		_handleTouchMove : function (e) {
			var self = this;
			if (e.targetTouches.length == 1) {
				e.preventDefault(); // 阻止浏览器默认事件，重要
				var touch = e.targetTouches[0];
				var theSelection = self.theSelection;
				var canvasOffset = self.canvas.offset();
				var iMouseX = self.iMouseX = Math.min(Math.max(touch.pageX - canvasOffset.left, 0), self.canvasW);
				var iMouseY = self.iMouseY = Math.min(Math.max(touch.pageY - canvasOffset.top, 0), self.canvasH);

				// in case of drag of whole selector
				if (theSelection.bDragAll) {
					var diffX = Math.min(Math.max(iMouseX - theSelection.get('px'), 0), self.canvasW - theSelection.get('w'));
					var diffY = Math.min(Math.max(iMouseY - theSelection.get('py'), 0), self.canvasH - theSelection.get('h'));
					return self.theSelection.move(diffX, diffY);
				}

				// in case of dragging of resize cubes
				self.theSelection.resize(iMouseX, iMouseY);
			}
			
		},
		_handleTouchEnd : function (e) {
			this._handleMouseUp(e);
			this._drawScene();
		},
		_handlePinchStart : function(e){
			this.pinchScale = e.scale;
			this.cropCoords = this.getCropCoords();
		},
		_handlePinch : function(e){
			var self = this;
			var scale = e.scale;
			self.setCropCoords(
				Math.max(self.cropCoords.x - (self.cropCoords.w * (scale-1)/2), 0),
				Math.max(self.cropCoords.y - (self.cropCoords.h * (scale-1)/2), 0),
				Math.min(self.cropCoords.w * scale, self.canvasW),
				Math.min(self.cropCoords.h * scale, self.canvasH)
			);
		},
		_handlePinchEnd : function(e){
			this.pinchScale = null;
			this.cropCoords = null;
		},
/*******************************移动设备支持*********************************/			
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
		reset : function () {
			this._init();
		},
		destroy : function () {
			this._unBind();
			this.canvas.remove();
			this.theSelection = null;
			if (this.preview) {
				this.preview.destroy();
			}
		},
		setCropCoords : function (x, y, w, h) {
			this.set({
				initialXY : [x, y],
				initWidth : w,
				initHeight : h
			});
		},
		//The top, left, height, width and image url of the image being cropped
		getCropCoords : function () {
			return S.merge(this.theSelection.getInfo(), {
				url : this.get('url'),
				r : this.image.width / this.canvasW
			});
		},
		getOriginalSize : function () {
			return {
				width : this.image.width,
				height : this.image.height
			};
		},
		getDisplaySize : function () {
			return {
				width : this.canvasW,
				height : this.canvasH
			};
		},
		toString : function (space) {
			return S.JSON.stringify(this.getCropCoords(), null, space || 0);
		}
	});
	return ImgCrop;
}, {
	attach : false,
	requires : ['./preview', './selection']
});

//http://developer.yahoo.com/yui/docs/YAHOO.widget.ImageCropper.html
