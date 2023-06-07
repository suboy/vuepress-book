import { defineClientConfig } from '@vuepress/client'
import waterRipple from './components/waterRipple.vue'
import adSense from './components/adSense.vue'
import shader from './components/shader.vue'

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    // console.log('defineClientConfig')
    app.component('WaterRipple', waterRipple)
    app.component('AdSense', adSense)
    app.component('Shader', shader)
  },
  // setup() {
  //   onMounted(()=>{
  //     console.log('setup', window)
  //   })
  // },
  rootComponents: [],
})