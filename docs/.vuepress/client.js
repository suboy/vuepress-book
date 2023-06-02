import { defineClientConfig } from '@vuepress/client'
import waterRipple from './components/waterRipple.vue'
import adSense from './components/adSense.vue'

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    // console.log('defineClientConfig')
    app.component('WaterRipple', waterRipple)
    app.component('AdSense', adSense)
  },
  // setup() {
  //   onMounted(()=>{
  //     console.log('setup', window)
  //   })
  // },
  rootComponents: [],
})