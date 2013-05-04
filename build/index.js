/**
 * 图片剪裁组件
 * author 元泉
 * date 2013-3-31
 */
KISSY.add(function (S, ImgCrop) {

    function Index(option) {
        return new ImgCrop(option);
    }

    return Index;
}, {
    requires:[
		'getContext' in document.createElement('canvas') ? './type/html5/imgcrop' : './type/normal/imgcrop'
	]
});
