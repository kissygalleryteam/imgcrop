
## 初始化组件
		
    S.use('kg/imgcrop/2.0.0/index', function (S, Imgcrop) {
         var imgcrop = new Imgcrop();
    })


## 综述

ImgCrop是一个对图片进行裁剪时选取坐标和尺寸的组件。
基于Canvas 兼容IE6+ 支持手持设备

* 版本：2.0.0
* 基于：kissy1.4.0+ 兼容 6.0.0
* 作者：元泉
* 维护: 宝码

##演示页面
[DEMO](/imgcrop/doc/demo/index.html)



### 1.加载ImgCrop模块,初始化ImgCrop

```javascript
KISSY.use('gallery/imgcrop/2.0/index', function (S, ImgCrop) {
  var crop = new ImgCrop({
    areaEl : "#J_CropBox", //图片的容器
    areaWidth : 500, //不配置默认取容器宽度
    areaHeight : 500, //不配置默认取容器高度
    initialXY : [10,10], //初始坐标
    initWidth : 200, //初始宽度
    initHeight : 200, //初始高度
    minHeight : 100, //最小高度
    minWidth : 100, //最小宽度
    previewEl : "#J_PrevBox", //预览容器，不需要的话可以不配置
    touchable : true, //支持touch、pinch
    ratio : true, //固定比例缩放
    resizable : true,//可以缩放
    url : 'http://img01.taobaocdn.com/imgextra/i1/14888019145001501/T1_iIPXl8dXXXXXXXX_!!855984888-0-pix.jpg'
  });

  crop.set("resizable", false);

  crop.render();
})
```


### Class ###
- ImgCrop

### Attributes
- **areaEl** 
  + {HTMLElement|NodeList} 容器
- **areaWidth** 
  + {Number} 容器宽度，不配置的话取容器本身的宽度
- **areaHeight** 
  + {Number} 容器高度，不配置的话取容器本身的高度
- **url** 
  + {String} 图片的地址
- **initWidth** 
  + {Number} 剪裁区域初始宽度
- **initHeight** 
  + {Number} 剪裁区域初始高度
- **initialXY**
  + {Array} 剪裁区域左上角坐标,如：[10,10]
- **resizable**
  + {Boolean} 是否允许缩放，默认true
- **ratio**
  + {Boolean} 是否固定比例，默认false
- **minWidth**
  + {Number} 剪裁区域最小宽度
- **minHeight**
  + {Number} 剪裁区域最小高度
- **previewEl**
  + {HTMLElement|NodeList} 预览窗口，不需要不配置
- **viewWidth**
  + {Number} 预览窗口宽度
- **viewHeight**
  + {Number} 预览窗口高度
- **borderColor**
  + {String} 选取框边框颜色,默认#fff
- **cubesColor**
  + {String} 拖动方块颜色,默认#fff
- **maskColor**
  + {String} 遮罩颜色,默认#000
- **maskOpacity**
  + {Number} 遮罩透明度,默认0.5



### Events
- **startdrag()**
- **drag()**
- **enddrag()**
- **resize()**
- **startresize()**
- **endresize()**
- **touch()**
- **starttouch()**
- **endtouch()**
- **pinch()**
- **startpinch()**
- **endpinch()**

### Method
- **render()**
  + 这是2.0.0版本新暴露出来的方法，构造函数中不会自动render，使用者按需调用
- **getDisplaySize()**
  + 当前显示图片的尺寸
- **getOriginalSize()**
  + 原始图片的尺寸
- **getCropCoords()**
  + 剪裁区域图片信息
- **setCropCoords(x,y,w,h)**
  + 重新设置剪裁区域位置
- **destroy()**
  + 销毁
