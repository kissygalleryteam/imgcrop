/**
 * @Selection 图像选择模块
 * @author 元泉 2013-5-4
 */
KISSY.add(function (S) {
    //选择对象
    function Selection() {
        Selection.superclass.constructor.apply(this, arguments);
        this.csize = 4; // resize cubes size
        this.bDrag = [false, false, false, false]; // drag statuses
        this.bDragAll = false; // drag whole selection
    }

    Selection.ATTRS = {
        x:{
            value:0
        },
        y:{
            value:0
        },
        w:{
            value:50
        },
        h:{
            value:50
        },
        ratio:{
            value:false
        },
        minWidth:{
            value:50
        },
        minHeight:{
            value:50
        },
        resizable:{
            value:true
        },
        borderColor:{
            value:'#fff'
        },
        cubesColor:{
            value:'#fff'
        },
        constraint:{
            value:[10000, 10000]
        }
    };
    S.extend(Selection, S.Base, {
        event:{
            DRAG:"drag",
            START_DRAG:"startdrag",
            END_DRAG:"enddrag",
            RESIZE:"resize",
            START_RESIZE:"startresize",
            END_RESIZE:"endresize"
        },
        /**
         * 绘画
         * @param ctx
         * @param image
         */
        draw:function (ctx, image) {
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
                x:Math.max(self.get('x'), 0),
                y:Math.max(self.get('y'), 0),
                w:Math.min(Math.max(self.get('w'), self.get('minWidth')), canvasW),
                h:Math.min(Math.max(self.get('h'), self.get('minHeight')), canvasH)
            };
            self.set(rect);
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

            // and make mask
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvasW, self.get('y'));
            ctx.fillRect(0, self.get('y'), self.get('x'), self.get('h'));
            ctx.fillRect(self.get('x') + self.get('w'), self.get('y'), canvasW - self.get('x') - self.get('w'), self.get('h'));
            ctx.fillRect(0, self.get('y') + self.get('h'), canvasW, canvasH - self.get('y') - self.get('h'));

            //这种形式图像会动
            /*
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvasW, canvasH);
            var r = image.width / canvasW;
            ctx.drawImage(image,
                self.get('x') * r,
                self.get('y') * r,
                self.get('w') * r,
                self.get('h') * r,
                self.get('x'),
                self.get('y'),
                self.get('w'),
                self.get('h')
            );*/

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
        getInfo:function () {
            return {
                x:this.get('x'),
                y:this.get('y'),
                w:this.get('w'),
                h:this.get('h')
            };
        },
        resize:function (iMouseX, iMouseY) {
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
            //固定比例
            if (self.get("ratio")) {
                iFH = iFW * self.get('h') / self.get("w");
            }
            self.set({
                w:iFW, x:iFX, h:iFH, y:iFY
            });
            self.fire(self.event.RESIZE);
        },
        move:function (diffX, diffY) {
            var self = this;
            self.set({
                x:Math.min(Math.max(self.get('px') + diffX, 0), self.get('constraint')[0] - self.get('w')),
                y:Math.min(Math.max(self.get('py') + diffY, 0), self.get('constraint')[1] - self.get('h'))
            });
            self.fire(self.event.DRAG);
        },
        registerPointPos:function (iMouseX, iMouseY) {
            var self = this;
            var code = -1;
            if (iMouseX > self.get('x') + self.csize &&
                iMouseX < self.get('x') + self.get('w') - self.csize &&
                iMouseY > self.get('y') + self.csize &&
                iMouseY < self.get('y') + self.get('h') - self.csize) {
                code = 0;
            }
            if (iMouseX > self.get('x') - self.csize && iMouseX < self.get('x') + self.csize &&
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
        markByCode:function (code) {
            var self = this;
            if (code === -1) return;
            if (code === 0) {
                self.bDragAll = true;
                self.fire(self.event.START_DRAG);
            } else {
                self.bDrag[code - 1] = true;
                self.fire(self.event.START_RESIZE);
            }
        },
        hoverByCode:function (code) {
            var self = this;
            switch (code) {
                case 0:
                    self.cursor = 'move';
                    break;
                case 1:
                case 3:
                    self.cursor = 'nw-resize';
                    break;
                case 2:
                case 4:
                    self.cursor = 'ne-resize';
                    break;
                default:
                    self.cursor = 'default';
            }
        },
        canMove:function () {
            return this.bDragAll;
        },
        canResize:function () {
            return S.inArray(true, this.bDrag);
        },
        reset:function () {
            this.bDragAll = false;
            for (i = 0; i < this.bDrag.length; i++) {
                this.bDrag[i] = false;
            }
        }
    });
    return Selection;
}, {
    attach:false
});
