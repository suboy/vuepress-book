<template>
<ins class="adsbygoogle"
  style=""
  data-ad-layout="in-article"
  data-ad-format="fluid"
  data-ad-client="ca-pub-9615232600361986"
  data-ad-slot="5278086699"/>
</template>

<script>
import { reactive, toRefs, onMounted } from 'vue'

export default {
  setup () {
    const state = reactive({})
    onMounted(()=>{
      // window.adsbygoogle = window.adsbygoogle || [];
      // window.adsbygoogle.push({})
    })
    return {
      ...toRefs(state),
    }
  }
}
</script>

<style lang="scss" scoped>

</style>