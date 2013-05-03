KISSY.add(function (S) {
	//选择对象
	function Selection() {
		Selection.superclass.constructor.apply(this, arguments);

		this.csize = 4; // resize cubes size
		this.csizeh = 6; // resize cubes size (on hover)

		this.bHover = [false, false, false, false]; // hover statuses
		this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
		this.bDrag = [false, false, false, false]; // drag statuses
		this.bDragAll = false; // drag whole selection
		this._init();
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

			if (this.get('resizable')) {
				// draw resize cubes
				ctx.fillStyle = this.get('cubesColor');
				//ctx.canvas.style.cursor = this.cursor;
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
		resetCubes : function () {
			var self = this;
			for (i = 0; i < self.bHover.length; i++) {
				self.bHover[i] = false;
				self.iCSize[i] = self.csize;
			}
		},
		_hovering : function (iMouseX, iMouseY) {
			var self = this;

			//reset cubes
			self.resetCubes();

			self.cursor = 'default';

			var mouseenter = false;

			if (iMouseX > self.get('x') - self.csizeh && iMouseX < self.get('x') + self.csizeh &&
				iMouseY > self.get('y') - self.csizeh && iMouseY < self.get('y') + self.csizeh) {

				mouseenter = self.bHover[0] = true;
				self.iCSize[0] = self.csizeh;

			} else if (iMouseX > self.get('x') + self.get('w') - self.csizeh && iMouseX < self.get('x') + self.get('w') + self.csizeh &&
				iMouseY > self.get('y') - self.csizeh && iMouseY < self.get('y') + self.csizeh) {

				mouseenter = self.bHover[1] = true;
				self.iCSize[1] = self.csizeh;

			} else if (iMouseX > self.get('x') + self.get('w') - self.csizeh && iMouseX < self.get('x') + self.get('w') + self.csizeh &&
				iMouseY > self.get('y') + self.get('h') - self.csizeh && iMouseY < self.get('y') + self.get('h') + self.csizeh) {

				mouseenter = self.bHover[2] = true;
				self.iCSize[2] = self.csizeh;

			} else if (iMouseX > self.get('x') - self.csizeh && iMouseX < self.get('x') + self.csizeh &&
				iMouseY > self.get('y') + self.get('h') - self.csizeh && iMouseY < self.get('y') + self.get('h') + self.csizeh) {

				mouseenter = self.bHover[3] = true;
				self.iCSize[3] = self.csizeh;

			} else if (iMouseX > self.get('x') + self.csizeh && iMouseX < self.get('x') + self.get('w') - self.csizeh &&
				iMouseY > self.get('y') + self.csizeh && iMouseY < self.get('y') + self.get('h') - self.csizeh) {

				self.cursor = 'move';
				mouseenter = true;

			}

			if (mouseenter) {
				self.fire(Selection.EVENT.HOVER);
			}
			
			return mouseenter;

		},

		resize : function (iMouseX, iMouseY) {
			var self = this;
			var resizing = false;

			var iFW, iFH, iFX, iFY;
			if (self.bDrag[0]) {
				iFX = iMouseX - self.get('px');
				iFY = iMouseY - self.get('py');
				iFW = self.get('w') + self.get('x') - iFX;
				iFH = self.get('h') + self.get('y') - iFY;
			} else if (self.bDrag[1]) {
				iFX = self.get('x');
				iFY = iMouseY - self.get('py');
				iFW = iMouseX - self.get('px') - iFX;
				iFH = self.get('h') + self.get('y') - iFY;
			} else if (self.bDrag[2]) {
				iFX = self.get('x');
				iFY = self.get('y');
				iFW = iMouseX - self.get('px') - iFX;
				iFH = iMouseY - self.get('py') - iFY;
			} else if (self.bDrag[3]) {
				iFX = iMouseX - self.get('px');
				iFY = self.get('y');
				iFW = self.get('w') + self.get('x') - iFX;
				iFH = iMouseY - self.get('py') - iFY;
			}
			
			resizing = S.inArray(true, self.bDrag);

			if (resizing) {
				self.set({
					w : iFW,
					x : iFX,
					h : iFH,
					y : iFY
				});
			}
			
			return resizing;

		},
		move : function (iMouseX, iMouseY) {
			var self = this;
			var moving = self.bDragAll;
			if (moving) {
				self.set({
					x : Math.min(Math.max(iMouseX - self.get('px'), 0), self.get('constraint')[0] - self.get('w')),
					y : Math.min(Math.max(iMouseY - self.get('py'), 0), self.get('constraint')[1] - self.get('h'))
				});
			}
			return moving;
		}
	});

	return Selection;
}, {
	attach : false
});
