/**
 * 图片剪裁组件
 * author 元泉
 * date 2013-5-4
 */
KISSY.add(function (S, ImgCropCanvas, ImgCropNormal) {
    return 'getContext' in document.createElement('canvas') ? ImgCropCanvas : ImgCropNormal;
}, {
    requires: [
        './type/html5/imgcrop',
        './type/normal/imgcrop'
    ]
});
