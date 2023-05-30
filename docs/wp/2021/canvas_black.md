---
title: "开发canvas游戏如果使用超过2048的图片会出现黑块"
date: "2021-05-21"
---

egret和cocos默认都是用webgl渲染模式，webgl使用底层的驱动级的图形接口，性能更优

解决黑块问题，一个办法是render\_mode改成canvas，不过这样动画会变得很卡；要不就是修改图片，不要超过2048

[https://webglreport.com/?v=2](https://webglreport.com/?v=2)

![](images/image-1.png)
