import{_ as l,r as i,o as r,c as t,e as s,b as o,f as p}from"./app-da893a5a.js";const n={},a=p("<p>昨天老婆看到一个js水波特效，问我怎么实现，我看了下，是用jquery.ripples做的。那能不能转成vue写呢</p><p>jquery.ripples: https://github.com/sirxemic/jquery.ripples</p><ul><li>将$及其方法替换掉，更新为现代代码风格</li><li>重写Ripples类，去掉一些啰嗦的代码，保留核心代码 <ul><li>初始化一个容器元素，append是个canvas，设置canvas浮动在容器上面</li><li>初始化canvas webgl，设置各种参数</li></ul></li><li>波纹算法部分是用WebGLRenderingContext实现的，改天再研究看看</li><li>波纹效果要配一张背景图才好看，但是不能从md传递url到vue <ul><li>在.vuepress下新建一个assets用来放图片吧，剩下的就跟平时用vue一样的了</li><li>最好使用nextTick初始化Ripple，防止dom没准备好而出现异常效果</li></ul></li><li>由于vue代码部分是用nodejs编译的，也就是跟SSR一样。代码中涉及到dom的部分，要在浏览器环境中才能执行，否则会报“ReferenceError: window is not defined” <ul><li>将loadConfig延后执行</li></ul></li></ul>",3);function c(u,d){const e=i("waterRipple");return r(),t("div",null,[a,s(" ![](images/river.jpg) "),o(e)])}const _=l(n,[["render",c],["__file","water-ripple-vue.html.vue"]]);export{_ as default};
