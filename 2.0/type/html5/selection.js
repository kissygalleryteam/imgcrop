KISSY.add(function (S) {
	//选择对象
	function Selection() {
		Selection.superclass.constructor.apply(this, arguments);

		this.csize = 4; // resize cubes size
		
		this.bDrag = [false, false, false, false]; // drag statuses
		this.bDragAll = false; // drag whole selection
		this._init();
	}
	Selection.EVENT = {
		DRAG : "drag",
		START_DRAG : "startdrag",
		END_DRAG : "enddrag",
		RESIZE : "resize",
		START_RESIZE : "startresize",
		END_RESIZE : "endresize",
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
		_init : function(){
			//this._bind();
		},
		_bind : function(){
			var self = this;
			self.on('*Change', function(e){
				S.each(e.attrName, function (attr, index) {
					switch (attr) {
						case 'x':
						case 'y':
							self.fire(Selection.EVENT.DRAG);
							break;
						case 'w':
						case 'h':
							self.fire(Selection.EVENT.RESIZE);
							break;
					}
				});
			});
		},
		draw : function (ctx) {
			ctx.strokeStyle = this.get('borderColor');
			ctx.lineWidth = 1;
			var rect = {
				x : Math.max(this.get('x'), 0),
				y : Math.max(this.get('y'), 0),
				w : Math.min(Math.max(this.get('w'), this.get('minWidth')), this.get('constraint')[0]),
				h : Math.min(Math.max(this.get('h'), this.get('minHeight')), this.get('constraint')[1])
			};
			this.set(rect);
			ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
			
			ctx.canvas.style.cursor = this.cursor;
			if (this.get('resizable')) {
				// draw resize cubes
				ctx.fillStyle = this.get('cubesColor');
				ctx.fillRect(this.get('x') - this.csize, this.get('y') - this.csize, this.csize * 2, this.csize * 2);
				ctx.fillRect(this.get('x') + this.get('w') - this.csize, this.get('y') - this.csize, this.csize * 2, this.csize * 2);
				ctx.fillRect(this.get('x') + this.get('w') - this.csize, this.get('y') + this.get('h') - this.csize, this.csize * 2, this.csize * 2);
				ctx.fillRect(this.get('x') - this.csize, this.get('y') + this.get('h') - this.csize, this.csize * 2, this.csize * 2);
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

		resize : function (iMouseX, iMouseY) {
			var self = this;

			var iFW, iFH, iFX, iFY;
			if (self.bDrag[0]) {
				iFX = iMouseX;
				iFY = iMouseY;
				iFW = self.get('w') + self.get('x') - iMouseX;
				iFH = self.get('h') + self.get('y') - iMouseY;
			} else if (self.bDrag[1]) {
				iFX = self.get('x');
				iFY = iMouseY;
				iFW = iMouseX - self.get('x');
				iFH = self.get('h') + self.get('y') - iMouseY;
			} else if (self.bDrag[2]) {
				iFX = self.get('x');
				iFY = self.get('y');
				iFW = iMouseX - self.get('x');
				iFH = iMouseY - self.get('y');
			} else if (self.bDrag[3]) {
				iFX = iMouseX;
				iFY = self.get('y');
				iFW = self.get('w') + self.get('x') - iMouseX;
				iFH = iMouseY - self.get('y');
			}
			
			self.set({
				w : iFW,
				x : iFX,
				h : iFH,
				y : iFY
			});
			self.fire(Selection.EVENT.RESIZE);

		},
		move : function (diffX, diffY) {
			var self = this;
			self.set({
				x : Math.min(Math.max(self.get('px')+diffX, 0), self.get('constraint')[0] - self.get('w')),
				y : Math.min(Math.max(self.get('py')+diffY, 0), self.get('constraint')[1] - self.get('h'))
			});
			self.fire(Selection.EVENT.DRAG);
		},
		registerPointPos : function(iMouseX, iMouseY){
			var self = this;
			var code = -1;
			if (iMouseX > self.get('x') + self.csize &&
				iMouseX < self.get('x') + self.get('w') - self.csize &&
				iMouseY > self.get('y') + self.csize &&
				iMouseY < self.get('y') + self.get('h') - self.csize) {
				
				code = 100;
			}
			
			if (iMouseX > self.get('x') - self.csize && iMouseX < self.get('x') + self.csize &&
				iMouseY > self.get('y') - self.csize && iMouseY < self.get('y') + self.csize) {

				code = 0;

			} else if (iMouseX > self.get('x') + self.get('w') - self.csize && iMouseX < self.get('x') + self.get('w') + self.csize &&
				iMouseY > self.get('y') - self.csize && iMouseY < self.get('y') + self.csize) {

				code = 1;

			} else if (iMouseX > self.get('x') + self.get('w') - self.csize && iMouseX < self.get('x') + self.get('w') + self.csize &&
				iMouseY > self.get('y') + self.get('h') - self.csize && iMouseY < self.get('y') + self.get('h') + self.csize) {

				code = 2;

			} else if (iMouseX > self.get('x') - self.csize && iMouseX < self.get('x') + self.csize &&
				iMouseY > self.get('y') + self.get('h') - self.csize && iMouseY < self.get('y') + self.get('h') + self.csize) {

				code = 3;

			}
			return code;
		},
		markByCode : function(code){
			var self = this;
			if(code === -1) return;
			
			if(code === 100){
				self.bDragAll = true;
				self.fire(Selection.EVENT.START_DRAG);
			}else{
				self.bDrag[code] = true;
				self.fire(Selection.EVENT.START_RESIZE);
			}
		},
		hoverByCode : function(code){
			var self = this;
			switch(code){
				case 100:
					self.cursor = 'move';
					break;
				case 0:
				case 2:
					self.cursor = 'nw-resize';
					break;
				case 1:
				case 3:
					self.cursor = 'ne-resize';
					break;
				default:
					self.cursor = 'default';
			}
		},
		canMove : function(){
			return this.bDragAll;
		},
		canResize : function(){
			return S.inArray(true, this.bDrag);
		},
		reset : function(){
			this.bDragAll = false;
			for (i = 0; i < this.bDrag.length; i++) {
				this.bDrag[i] = false;
			}
		}
	});

	return Selection;
}, {
	attach : false
});
