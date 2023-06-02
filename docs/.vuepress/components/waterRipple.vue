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
import { reactive, toRefs, onMounted } from 'vue'
import initRipples from '../libs/useWaterRipple.js'

export default {
  name: 'waterRipple',
  setup(props, { attrs }) {
    // console.log(props, attrs)
    const state = reactive({
      image: '',
      rippleRef: null,
      ripple: null
    })
    // console.log(import.meta.url)
    const image = ()=>import(attrs.image)
    onMounted(()=>{
      image().then((data)=>{
        // console.log(data)
        // state.image = data.default
        state.ripple = initRipples(state.rippleRef, {
          imageUrl: data.default,   // 背景图url
          rain: true,               // 自动滴水
          interactive: true,        // 鼠标滑过波纹
        })
        window.addEventListener("blur", ()=>{
          state.ripple.pause()
        })
        window.addEventListener("focus", ()=>{
          state.ripple.play()
        })
      }).catch(e=>{
        console.log('import', attrs.image, e)
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
