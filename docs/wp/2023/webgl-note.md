---
title: "webgl学习"
date: "2023-06-03"
---

- 检查webgl扩展支持
  * 'OES_texture_float', 'OES_texture_half_float', 'OES_texture_float_linear', 'OES_texture_half_float_linear'优先启用float，不支持则使用half_float
  * 
- 概念
  * WebGLTexture 纹理材质 https://developer.mozilla.org/en-US/docs/Web/API/WebGLTexture
  * WebGLFramebuffer 缓冲区集合 https://developer.mozilla.org/en-US/docs/Web/API/WebGLFramebuffer
  * texParameter[fi] 设置纹理参数 https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter