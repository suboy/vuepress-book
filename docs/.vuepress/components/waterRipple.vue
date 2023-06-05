<style lang="scss">
.water-ripple-main{
  width: 100%;
  height: 400px;
}
</style>
<template>
  <div ref="rippleRef" class="water-ripple-main" :style="`background-image: url(${image});`"></div>
  <button @click="pauseRipple">pause</button>
  <button @click="playRipple">play</button>
</template>
<script>
import { reactive, toRefs, toRaw, onMounted } from 'vue'
// import initRipples from '../libs/useWaterRipple.js'
import waterRippleClass from '../libs/waterRippleClass.js'
import bgImage from '../assets/river.jpg'

export default {
  name: 'waterRipple',
  setup() {
    // console.log(props, attrs)
    const state = reactive({
      image: '',
      rippleRef: null,
      ripple: null
    })
    // console.log(import.meta.url)
    onMounted(()=>{
      state.ripple = waterRippleClass.initRipples(state.rippleRef, {
        imageUrl: bgImage,   // 背景图url
        rain: true,               // 自动滴水
        interactive: true,        // 鼠标滑过波纹
      })
      // state.ripple = initRipples(state.rippleRef, {
      //   imageUrl: bgImage,   // 背景图url
      //   rain: true,               // 自动滴水
      //   interactive: true,        // 鼠标滑过波纹
      // })
      console.log(toRaw(state.ripple))
      window.addEventListener("blur", ()=>{
        state.ripple.pause()
      })
      window.addEventListener("focus", ()=>{
        state.ripple.play()
      })
    })
    return {
      ...toRefs(state),
      pauseRipple() {
        state.ripple.pause()
      },
      playRipple() {
        state.ripple.play()
      }
      // initRipples: (el)=>{
      //   nextTick(()=>{
      //     initRipples(el)
      //   })
      // }
    }
  }
}

</script>
