var ImgCropCanvas = require('./lib/html5/imgcrop');
var ImgCropNormal = require('./lib/normal/imgcrop');

var Imgcrop = 'getContext' in document.createElement('canvas') ? ImgCropCanvas : ImgCropNormal;

module.exports = Imgcrop;
