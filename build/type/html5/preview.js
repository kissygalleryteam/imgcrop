/**
 * @Preview 预览模块
 * @author 元泉 2013-5-4
 */
KISSY.add(function (S) {
    var $ = S.all;
    //预览对象
    function Preview() {
        Preview.superclass.constructor.apply(this, arguments);
        this.canvas = $('<canvas>');
        this.ctx = this.canvas[0].getContext('2d');
        this.container = $(this.get('previewEl'));
        this._init();
    }

    Preview.ATTRS = {
        previewEl:{
            value:''
        },
        viewHeight:{
            value:300
        },
        viewWidth:{
            value:300
        },
        image:{
            value:null
        }
    };
    S.extend(Preview, S.Base, {
        _init:function () {
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
            self._rejustSize();
        },
        _rejustSize:function () {
            var self = this;
            var image = self.get('image'),
                viewWidth = self.get('viewWidth'),
                viewHeight = self.get('viewHeight'),
                imgW = image.width,
                imgH = image.height,
                new_width,
                new_height;
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
                top:(self.container.height() - self.canvasH) / 2,
                left:(self.container.width() - self.canvasW) / 2
            });
        },
        draw:function (x, y, w, h, r) {
            var self = this;
            // clear canvas
            self.ctx.clearRect(0, 0, self.canvasW, self.canvasH);
            var image = self.get('image');
            var preW = Math.floor(w * r * self.canvasW / image.width);
            var preH = Math.floor(h * r * self.canvasH / image.height);
            self.ctx.drawImage(image, Math.floor(x * r), Math.floor(y * r), Math.floor(w * r), Math.floor(h * r), 0, 0, preW, preH);
        },
        destroy:function () {
            this.canvas.remove();
        }
    });
    return Preview;
}, {
    attach:false
});
