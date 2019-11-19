<template>
  <div id="app">
    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>
import fetch from './assets/js/fetch-config'
export default {
  async mounted () {
    try {
      let res = await fetch.get('/api/demo')
      console.log(res, 15)
    } catch (e) {
      throw e
    }
  }
}
</script>
<style lang="scss">

</style>
