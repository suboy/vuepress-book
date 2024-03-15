---
title: "text-overflow ellipsis将...放在左边"
date: "2022-03-22"
---

text-overflow ellipsis默认是省略右边的文字，有时候一段文字有用的信息在右边，这就需要省略左边的文字

使用direction: rtl;使文字从右往左书写，但是有个缺陷  
direction会文本书写方向，位置偏移，字顺序不变，标点符号方向变化  
最后一个字符如果是标点符号的话，会移到左边

![](images/image-2.png)

![](images/image.png)

![](images/image-1.png)
