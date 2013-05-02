/*
 * 图像剪裁组件
 * 基于canvas
 */
KISSY.add(function (S) {
	var $ = S.all;

	//选择对象
	function Selection() {
		Selection.superclass.constructor.apply(this, arguments);

		this.csize = 4; // resize cubes size
		this.csizeh = 6; // resize cubes size (on hover)

		this.bHover = [false, false, false, false]; // hover statuses
		this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
		this.bDrag  = [false, false, false, false]; // drag statuses
		this.bDragAll = false; // drag whole selection
	}
	Selection.EVENT = {
		DRAG : "drag",
		RESIZE : "resize",
		HOVER : "hover"
	};
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
		px : {
			value : 0
		},
		py : {
			value : 0
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
		constraint : {
			value : [10000, 10000]
		}
	};
	S.extend(Selection, S.Base, {
		draw : function (ctx) {
			ctx.strokeStyle = this.get('borderColor');
			ctx.lineWidth = 1;
			ctx.strokeRect(this.get('x'), this.get('y'), this.get('w'), this.get('h'));

			if(this.get('resizable')){
				// draw resize cubes
				ctx.fillStyle = this.get('cubesColor');
				ctx.canvas.style.cursor = this.cursor;
				ctx.fillRect(this.get('x') - this.iCSize[0], this.get('y') - this.iCSize[0], this.iCSize[0] * 2, this.iCSize[0] * 2);
				ctx.fillRect(this.get('x') + this.get('w') - this.iCSize[1], this.get('y') - this.iCSize[1], this.iCSize[1] * 2, this.iCSize[1] * 2);
				ctx.fillRect(this.get('x') + this.get('w') - this.iCSize[2], this.get('y') + this.get('h') - this.iCSize[2], this.iCSize[2] * 2, this.iCSize[2] * 2);
				ctx.fillRect(this.get('x') - this.iCSize[3], this.get('y') + this.get('h') - this.iCSize[3], this.iCSize[3] * 2, this.iCSize[3] * 2);
			}
		},
		getInfo : function () {
			return {
				x : this.get('x'),
				y : this.get('y'),
				w : this.get('w'),
				h : this.get('h')
			}
		},
		_resetCubes : function(){
			var self = this;
			for (i = 0; i < self.bHover.length; i++) {
				self.bHover[i] = false;
				self.iCSize[i] = self.csize;
			}
		},
		_hovering : function(iMouseX, iMouseY){
			var self = this;
			
			//reset cubes
			self._resetCubes();
			
			self.cursor = 'default';
			
			var mouseenter = false;
			
			if (iMouseX > self.get('x') - self.csizeh && iMouseX < self.get('x') + self.csizeh &&
				iMouseY > self.get('y') - self.csizeh && iMouseY < self.get('y') + self.csizeh) {

				mouseenter = self.bHover[0] = true;
				self.iCSize[0] = self.csizeh;
				
			}else if (iMouseX > self.get('x') + self.get('w') - self.csizeh && iMouseX < self.get('x') + self.get('w') + self.csizeh &&
				iMouseY > self.get('y') - self.csizeh && iMouseY < self.get('y') + self.csizeh) {

				mouseenter = self.bHover[1] = true;
				self.iCSize[1] = self.csizeh;
				
			}else if(iMouseX > self.get('x') + self.get('w') - self.csizeh && iMouseX < self.get('x') + self.get('w') + self.csizeh &&
				iMouseY > self.get('y') + self.get('h') - self.csizeh && iMouseY < self.get('y') + self.get('h') + self.csizeh) {

				mouseenter = self.bHover[2] = true;
				self.iCSize[2] = self.csizeh;
				
			}else if (iMouseX > self.get('x') - self.csizeh && iMouseX < self.get('x') + self.csizeh &&
				iMouseY > self.get('y') + self.get('h') - self.csizeh && iMouseY < self.get('y') + self.get('h') + self.csizeh) {

				mouseenter = self.bHover[3] = true;
				self.iCSize[3] = self.csizeh;
				
			}else if (iMouseX > self.get('x') + self.csizeh && iMouseX < self.get('x') + self.get('w') - self.csizeh &&
				iMouseY > self.get('y') + self.csizeh && iMouseY < self.get('y') + self.get('h') - self.csizeh) {
				
				self.cursor = 'move';
				mouseenter = true;
				
			}
			
			if(mouseenter){
				self.fire(Selection.EVENT.HOVER);
			}
			
		},
		
		resize : function(iMouseX, iMouseY){
			var self = this;
			
			var iFW, iFH, iFX, iFY;
			if (self.bDrag[0]) {
				iFX = iMouseX - self.get('px');
				iFY = iMouseY - self.get('py');
				iFW = self.get('w') + self.get('x') - iFX;
				iFH = self.get('h') + self.get('y') - iFY;
			}else if (self.bDrag[1]) {
				iFX = self.get('x');
				iFY = iMouseY - self.get('py');
				iFW = iMouseX - self.get('px') - iFX;
				iFH = self.get('h') + self.get('y') - iFY;
			}else if (self.bDrag[2]) {
				iFX = self.get('x');
				iFY = self.get('y');
				iFW = iMouseX - self.get('px') - iFX;
				iFH = iMouseY - self.get('py') - iFY;
			}else if (self.bDrag[3]) {
				iFX = iMouseX - self.get('px');
				iFY = self.get('y');
				iFW = self.get('w') + self.get('x') - iFX;
				iFH = iMouseY - self.get('py') - iFY;
			}
			
			if(S.inArray(true, self.bDrag)){
				self.set({
					w : Math.min(Math.max(self.get('minWidth'), iFW), self.get('constraint')[0]),
					x : iFX,
					h : Math.min(Math.max(self.get('minHeight'), iFH), self.get('constraint')[1]),
					y : iFY
				});
				self.fire(Selection.EVENT.RESIZE);
			}		
			
		},
		move : function (diffX, diffY) {
			var self = this;
			self.set({
				x : diffX,
				y : diffY
			});
			self.fire(Selection.EVENT.DRAG);
		}
	});
	
	//预览对象
	function Preview(){
		Preview.superclass.constructor.apply(this, arguments);
		this.canvas = $('<canvas>');
		this.ctx = this.canvas[0].getContext('2d');
		this.container = $(this.get('previewEl'));
		this._init();
	}
	Preview.ATTRS = {
		previewEl : {
			value : ''
		},
		viewHeight : {
			value : 300
		},
		viewWidth : {
			value : 300
		},
		image : {
			value : null
		}
	};
	S.extend(Preview, S.Base, {
		_init : function(){
			this._build();
		},
		_build : function(){
			var self = this;
			var viewWidth = self.get('viewWidth');
			var viewHeight = self.get('viewHeight');

			self.container.css({
				position : "relative",
				width  : viewWidth || self.container.width(),
				height : viewHeight || self.container.height()
			});

			self.container.html('').append(self.canvas.css({
				position : 'absolute'
			}));
			
			self._rejustSize();
		},
		_rejustSize : function(){
			var self = this;
			var image = self.get('image'), viewWidth = self.get('viewWidth'), viewHeight = self.get('viewHeight');
			var imgW = image.width, imgH = image.height, new_width, new_height;
			
			if ((imgW / viewWidth) > (imgH / viewHeight)) {
				new_width = Math.min(viewWidth, imgW);
				new_height = new_width * imgH / imgW;
			} else {
				new_height = Math.min(viewHeight, imgH);
				new_width = new_height * imgW / imgH;
			}

			self.canvas[0].width = self.canvasW = Math.floor(new_width);
			self.canvas[0].height = self.canvasH = Math.floor(new_height);

			self.canvas.css({
				top : (self.container.height() - self.canvasH) / 2,
				left : (self.container.width() - self.canvasW) / 2
			});
		},
		draw : function(x, y, w, h, r){
			var self = this;
			// clear canvas
			self.ctx.clearRect(0, 0, self.canvasW, self.canvasH);
			var image = self.get('image');
			
			var preW = Math.floor(w*r*self.canvasW/image.width);
			var preH = Math.floor(h*r*self.canvasH/image.height);
			self.ctx.drawImage(image, Math.floor(x*r), Math.floor(y*r), Math.floor(w*r), Math.floor(h*r), 0, 0, preW, preH);
		},
		destroy : function(){
			this.canvas.remove();
		}
	});
	

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
			$(document).on('mousemove', self._handleMouseMove, self);
			self.canvas.on('mousedown', self._handleMouseDown, self);
			$(document).on('mouseup', self._handleMouseUp, self);
			self.on("*Change", self._doAttrChange, self);
		},
		_unBind : function(){
			var self = this;
			$(document).detach('mousemove', self._handleMouseMove, self);
			self.canvas.detach('mousedown', self._handleMouseDown, self);
			$(document).detach('mouseup', self._handleMouseUp, self);
			self.detach("*Change", self._doAttrChange, self);
		},
		_doAttrChange : function(e){
			var self = this;

			S.each(e.attrName, function(attr, index){
				var value = e.newVal[index];
				switch(attr){
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
					default :
						self.reset();
				}
			});
			
		},
		_createPreview : function(){
			var self = this;
			//不需预览
			if(!S.one(self.get('previewEl'))) return;
			
			self.preview = new Preview({
				image : self.image,
				previewEl : self.get('previewEl'),
				viewHeight : self.get('viewHeight'),
				viewWidth : self.get('viewWidth')
			});
			self.on("imgload resize drag", function(){
				var Coords = self.getCropCoords();
				self.preview.draw(Coords.x, Coords.y, Coords.w, Coords.h, Coords.r);
			});
		},
		_createSelection : function(){
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
			
			self.theSelection.detach("drag", _doDrag).on("drag", _doDrag);
			self.theSelection.detach("resize", _doResize).on("resize", _doResize);
			self.theSelection.detach("hover", _doHover).on("hover", _doHover);
			self.theSelection.detach("*Change", _doChange).on("*Change", _doChange);
			
			function _doDrag(){
				self.fire(ImgCrop.EVENT.DRAG);
				self._drawScene();
			}
			
			function _doResize(){
				self.fire(ImgCrop.EVENT.RESIZE);
				self._drawScene();
			}
			
			function _doHover(){
				self._drawScene();
			}
			
			function _doChange(e){
				self._drawScene();
			}
		},
		_build : function () {
			var self = this;
			var areaWidth = self.get('areaWidth');
			var areaHeight = self.get('areaHeight');

			self.container.css({
				position : "relative",
				width  : areaWidth || self.container.width(),
				height : areaHeight || self.container.height()
			});
			
			self.canvas.detach("selectstart mousedown", _doPreventDefault).on("selectstart mousedown", _doPreventDefault);
			
			function _doPreventDefault(e){
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

		_handleMouseMove : function (e) {
			var self = this;
			//清除选择
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();

			var theSelection = self.theSelection;
			var canvasOffset = self.canvas.offset();
			var iMouseX = self.iMouseX = Math.min(Math.max(e.pageX - canvasOffset.left, 0), self.canvasW);
			var iMouseY = self.iMouseY = Math.min(Math.max(e.pageY - canvasOffset.top, 0), self.canvasH);

			// in case of drag of whole selector
			if (theSelection.bDragAll) {
				var diffX = Math.min(Math.max(iMouseX - theSelection.get('px'), 0), self.canvasW - theSelection.get('w'));
				var diffY = Math.min(Math.max(iMouseY - theSelection.get('py'), 0), self.canvasH - theSelection.get('h'));
				return self.theSelection.move(diffX, diffY);
			}

			// hovering over resize cubes
			self.theSelection._hovering(iMouseX, iMouseY);

			// in case of dragging of resize cubes
			self.theSelection.resize(iMouseX, iMouseY);
			
		},
		_handleMouseDown : function (e) {
			var self = this;
			var theSelection = self.theSelection;
			var canvasOffset = self.canvas.offset();
			var iMouseX = self.iMouseX = Math.floor(e.pageX - canvasOffset.left);
			var iMouseY = self.iMouseY = Math.floor(e.pageY - canvasOffset.top);

			var px, py;
			if (theSelection.bHover[0]) {
				px = iMouseX - theSelection.get('x');
				py = iMouseY - theSelection.get('y');
			}else if (theSelection.bHover[1]) {
				px = iMouseX - theSelection.get('x') - theSelection.get('w');
				py = iMouseY - theSelection.get('y');
			}else if (theSelection.bHover[2]) {
				px = iMouseX - theSelection.get('x') - theSelection.get('w');
				py = iMouseY - theSelection.get('y') - theSelection.get('h');
			}else if (theSelection.bHover[3]) {
				px = iMouseX - theSelection.get('x');
				py = iMouseY - theSelection.get('y') - theSelection.get('h');
			}else{
				px = iMouseX - theSelection.get('x');
				py = iMouseY - theSelection.get('y');
			}
			
			theSelection.set({
				px : px,
				py : py
			});

			if (iMouseX > theSelection.get('x') + theSelection.csizeh && 
				iMouseX < theSelection.get('x') + theSelection.get('w') - theSelection.csizeh &&
				iMouseY > theSelection.get('y') + theSelection.csizeh && 
				iMouseY < theSelection.get('y') + theSelection.get('h') - theSelection.csizeh) {

				theSelection.bDragAll = true;
			}

			for (i = 0; i < 4; i++) {
				theSelection.bDrag[i] = theSelection.bHover[i];
			}
			
			self.fire(ImgCrop.EVENT.START_DRAG);
			self.fire(ImgCrop.EVENT.START_RESIZE);
		},
		_handleMouseUp : function (e) {
			var self = this;
			var theSelection = self.theSelection;
			theSelection.bDragAll = false;
			for (i = 0; i < theSelection.bDrag.length; i++) {
				theSelection.bDrag[i] = false;
			}
			theSelection.set({
				px : 0,
				py : 0
			});
			self.fire(ImgCrop.EVENT.END_DRAG);
			self.fire(ImgCrop.EVENT.END_RESIZE);
		},
		_rejustSize : function (imgW, imgH, conW, conH) {
			var self = this, new_width, new_height;
			
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
		reset : function(){
			this._init();
		},
		destroy : function(){
			this._unBind();
			this.canvas.remove();
			this.theSelection = null;
			if(this.preview){
				this.preview.destroy();
			}
		},
		setCropCoords : function(x, y, w, h){
			this.set({
				initialXY : [x, y],
				initWidth : w,
				initHeight: h
			});
		},
		//The top, left, height, width and image url of the image being cropped
		getCropCoords : function(){
			return S.merge(this.theSelection.getInfo(),{
				url : this.get('url'),
				r : this.image.width / this.canvasW
			});
		},
		getOriginalSize : function(){
			return {
				width : this.image.width,
				height : this.image.height
			};
		},
		getDisplaySize : function(){
			return {
				width : this.canvasW,
				height : this.canvasH
			};
		},
		toString : function(){
			return S.JSON.stringify(this.getCropCoords());
		}
	});
	return ImgCrop;
}, {
	attach : false
});


//http://developer.yahoo.com/yui/docs/YAHOO.widget.ImageCropper.html