/**
 * 图片剪裁组件
 * author 元泉
 * date 2013-5-4
 */
KISSY.add(function (S, ImgCropCanvas, ImgCropNormal) {
    var surportCanvas = 'getContext' in document.createElement('canvas');
    function Index(option) {
        var ImgCrop = surportCanvas ? ImgCropCanvas : ImgCropNormal;
        return new ImgCrop(option);
    }
    return Index;
}, {
    requires:[
		'./type/html5/imgcrop',
        './type/normal/imgcrop'
	]
});
