<style lang="scss"></style>
<template>
<div>
  <canvas ref="canvasRef" width="500" height="400"></canvas>
  <div>
    <button @click="helloWorld">helloWorld</button>
    <button @click="imageTexture">图片纹理</button>
  </div>
</div>
</template>
<script>
import { reactive, toRefs, onMounted } from 'vue'
import { createProgram, setTexture, setAttribute, setUniform, resetWebgl } from '../libs/webgl.js'
import riverImage from '../assets/river.jpg'
import imageVertexSrc from '../shader/image.vert.glsl?raw'
import imageFragmentSrc from '../shader/image.frag.glsl?raw'
import helloVertexSrc from '../shader/hello.vert.glsl?raw'
import helloFragmentSrc from '../shader/hello.frag.glsl?raw'


export default {
  setup () {
    const state = reactive({
      canvasRef: null,
    })
    onMounted(() => {
      const el = state.canvasRef
      imageTexture(el)
    })
    return {
      ...toRefs(state),
      helloWorld() {
        helloWorld(state.canvasRef)
      },
      imageTexture() {
        imageTexture(state.canvasRef)
      }
    }
  }
}

function imageTexture(el) {
  const gl = el.getContext('webgl') || el.getContext('experimental-webgl')
  resetWebgl(gl)
  // 创建shader程序
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
