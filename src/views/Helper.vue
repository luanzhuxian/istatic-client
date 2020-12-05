<template>
  <div
    :class="$style.helper"
    class="container"
  >
    <el-menu router :default-active="activeIndex" class="el-menu-demo" mode="horizontal">
      <el-menu-item :route="{ name: 'CodeHelper' }">代码应用</el-menu-item>
    </el-menu>
    <div :class="$style.wrap">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Helper',
  data () {
    return {
    }
  },
  computed: {
    activeIndex () {
      return this.$route.path
    }
  }
}
</script>

<style module lang="scss">
  .helper {
    font-size: 14px;
  }
</style>
