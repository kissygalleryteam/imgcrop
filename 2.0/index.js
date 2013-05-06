/**
 * 图片剪裁组件
 * author 元泉
 * date 2013-5-4
 */
var __surportCanvas = 'getContext' in document.createElement('canvas');
KISSY.add(function (S, ImgCrop) {

    function Index(option) {
        return new ImgCrop(option);
    }

    return Index;
}, {
    requires:[
		__surportCanvas ? './type/html5/imgcrop' : './type/normal/imgcrop', !__surportCanvas ? './index.css' : ''
	]
});
