<template>
  <div id="app">
    <Header />
    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>
import Header from './components/Header.vue'
export default {
  components: {
    Header
  },
  data () {
    return {
      recycleBin: false
    }
  },
  async mounted () {
  }
}
</script>
<style lang="scss">

</style>
