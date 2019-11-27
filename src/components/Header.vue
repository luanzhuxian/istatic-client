<template>
  <div :class="$style.header">
    <el-menu
      mode="horizontal"
      background-color="#2c303a"
      text-color="#fbf5fb"
      active-text-color="#fff"
      router
      :class="$style.nav"
    >
      <el-menu-item
        :route="{ name: 'Home' }"
        index="1"
      >
        首页
      </el-menu-item>
      <el-menu-item
        :route="{ name: 'Icons' }"
        index="2"
      >
        图标管理
      </el-menu-item>
      <el-menu-item
        :route="{ name: 'Images' }"
        index="3"
      >
        文件管理
      </el-menu-item>
    </el-menu>

    <div :class="$style.headerBg" />
  </div>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style module lang="scss">
  .header {
    background-color: #2c303a;
    > .nav {
      padding: 0 300px;
      border: none !important;
    }
  }
  .headerBg {
    width: 100%;
    height: 205px;
    padding: 0 300px;
    background: #000 url("https://penglai-weimall.oss-cn-hangzhou.aliyuncs.com/static/timg.jpg") no-repeat center center;
    background-size: 50%;
  }
</style>
