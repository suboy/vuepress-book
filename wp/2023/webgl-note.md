---
title: "webgl shader笔记"
date: "2023-06-05"
---

### 概念
- gpu程序与cpu程序有些差异，cpu是串行执行，gpu是并行执行
- 与worker相似，编写一段shader着色器程序在gpu运行，并且js和shader间可以相互传递数据
- webgl的功能方法很复杂繁琐，先封装几个函数备用
  ``` javascript
  // 创建一个着色器shader程序
  export function createProgram(gl, vertexSrc, fragmentSrc){
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)    // 创建顶点着色器
    gl.shaderSource(vertexShader, vertexSrc)          // 绑定顶点着色器源码
    gl.compileShader(vertexShader)                    // 编译定点着色器
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)  // 创建片段着色器
    gl.shaderSource(fragmentShader, fragmentSrc)      // 绑定片段着色器源码
    gl.compileShader(fragmentShader)                  // 编译片段着色器
    const program = gl.createProgram()                // 创建着色器程序
    gl.attachShader(program, vertexShader)            // 指定顶点着色器
    gl.attachShader(program, fragmentShader)          // 指定片段着色色器
    gl.linkProgram(program)                           // 链接程序
    gl.useProgram(program)                            // 使用着色器
    gl.program = program
    return program      // 返回程序对象，后面设置参数的时候会用到
  }
  ```
  ``` javascript
  // 设置shader程序的attribute变量
  export function setAttribute(gl, program, name, data, options) {
    const attr = gl.getAttribLocation(program, name)  // 获取程序变量
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, options.usage||gl.STATIC_DRAW) // 设置变量值
    gl.enableVertexAttribArray(attr)      // 启用变量
    gl.vertexAttribPointer(  // 设置变量属性
      attr,
      options.size,               // attribute的分量数 1,2,3,4
      options.type||gl.FLOAT,     // attribute数据类型
      options.normalize||false,   // 是否归一化
      options.stride||0,          // 每个顶点数据占用的字节数
      options.offset||0)          // 顶点数据在缓冲区中的偏移量
  }
  ```
  ``` javascript
  // 设置shader程序的uniform变量
  export function setUniform(gl, program, typeSuffix, name, ...values) {
    const func = gl['uniform'+typeSuffix]
    func && func.call(gl, gl.getUniformLocation(program, name), ...values)
  }
  ```
  ``` javascript
  // 将一张图片设置为纹理，并绑定到纹理单元0
  export function setTexture(gl, image) {
    var texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // 水平重复方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    // 垂直重复方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // 缩小过滤方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    // 放大过滤方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    // 纹理数据上传到GPU
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  }
  ```

### HelloWorld
创建一个三原色叠加的图形
``` glsl
// hello.vert.glsl
attribute vec2 a_position;  // 图片区域的4个顶点

void main() {  // 返回顶点，顶点所围成的区域就是整个图像
  gl_Position = vec4(a_position.xy, 0.0, 1.0);
}
```
``` glsl
// hello.frag.glsl
#ifdef GL_ES
precision mediump float;    // 默认中精度
#endif

uniform vec2 u_resolution;    // canvas的宽高vec2(width, height)

void main(){
  // 坐标系扩大2倍，并将原点移动到canvas中心，width与height的最小项长度定为2
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution)/min(u_resolution.x, u_resolution.y);
  vec3 color1=vec3(0.0, 0.0, 0.0);
  vec3 color2=vec3(0.0, 0.0, 0.0);
  vec3 color3=vec3(0.0, 0.0, 0.0);
  if(distance(vec2(-0.2, -0.2),vec2(p.xy))<=0.4){ // 红色的圆形区域
    color1=vec3(1.0, 0.0, 0.0);
  }
  if(distance(vec2(0.2, -0.2),vec2(p.xy))<=0.4){ // 绿色的圆形区域
    color2=vec3(0.0, 1.0, 0.0);
  }
  if(distance(vec2(0.0, 0.2),vec2(p.xy))<=0.4){ // 蓝色的圆形区域
    color3=vec3(0.0, 0.0, 1.0);
  }
  vec3 color=vec3(0.0, 0.0, 0.0) + color1 + color2 + color3; // 颜色叠加
  gl_FragColor=vec4(color, 1.0); // 返回颜色值，设置区域内所有点的颜色，构成图像
}
```
``` javascript 
import helloVertexSrc from '../shader/hello.vert.glsl?raw'
import helloFragmentSrc from '../shader/hello.frag.glsl?raw'
function helloWorld(el) {
  const gl = el.getContext('webgl') || el.getContext('experimental-webgl')
  resetWebgl(gl)
  // 创建shader程序
  const shaderProgram = createProgram(gl, helloVertexSrc, helloFragmentSrc)
  // 设置顶点属性
  setAttribute(gl, shaderProgram, 'a_position',
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1
    ]), {
      usage: gl.STATIC_DRAW,
      size: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0,
  })
  setUniform(gl, shaderProgram, '2f', 'u_resolution', el.width, el.height)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
</script>

```

### 使用图片纹理
将图片渲染到webgl中
``` glsl
// image.vert.glsl
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position.xy, 0.0, 1.0);
  // v_texCoord = a_texCoord;
  v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);    // 变换坐标，不然图像是倒的
}
```
``` glsl
// image.frag.glsl
precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_texCoord;
void main() {
  gl_FragColor = texture2D(u_texture, v_texCoord);
}
```
``` js
import imageVertexSrc from '../shader/image.vert.glsl?raw'
import imageFragmentSrc from '../shader/image.frag.glsl?raw'
function imageTexture(el) {
  const gl = el.getContext('webgl') || el.getContext('experimental-webgl')
  resetWebgl(gl)
  const shaderProgram = createProgram(gl, imageVertexSrc, imageFragmentSrc)
  // 设置顶点属性
  setAttribute(gl, shaderProgram, 'a_position',
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1
    ]), {
      usage: gl.STATIC_DRAW,
      size: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0,
  })
  setAttribute(gl, shaderProgram, 'a_texCoord', new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1
  ]), {
    usage: gl.STATIC_DRAW,
    size: 2,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0,
  })
  // 设置纹理
  let img = new Image()
  img.onload = ()=>{
    setTexture(gl, img)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    img = null
  }
  img.src = riverImage
  setUniform(gl, shaderProgram, '2f', 'u_resolution', el.width, el.height)
  setUniform(gl, shaderProgram, '1i', 'u_texture', 0)   // gl.TEXTURE0
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
```

### 算法
未完待续

### 实例效果
<Shader />