KISSY.add('kg/imgcrop/2.0.0/index',["./lib/html5/imgcrop","./lib/normal/imgcrop"],function(S ,require, exports, module) {
 var ImgCropCanvas = require('./lib/html5/imgcrop');
var ImgCropNormal = require('./lib/normal/imgcrop');

var Imgcrop = 'getContext' in document.createElement('canvas') ? ImgCropCanvas : ImgCropNormal;

module.exports = Imgcrop;

});