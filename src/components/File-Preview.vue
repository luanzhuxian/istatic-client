<template>
  <transition name="fade">
    <div v-show="visibleBox" :class="$style.preview" @click.self="close">
      <transition name="slide-right">
        <div v-show="visibleContent" :class="$style.contentBox">
          <div :class="$style.top">
            <span>详情</span>
            <i @click.stop="close" class="el-icon-close"></i>
          </div>
          <div :class="$style.content">
            <div :class="$style.previewBox">
              <img v-show="!error" ref="img" :src="data.url" alt="" @load="imgOnload">
              <span v-show="error">暂不支持预览</span>
            </div>
            <div :class="$style.detailInfo">
              <div :class="$style.field">
                <span :class="$style.fieldname">文件名称</span>
                <span :class="$style.fieldvalue" v-text="data.name" />
              </div>
              <div :class="$style.field">
                <span :class="$style.fieldname">URL</span>
                <div>
                  <span :class="$style.fieldvalue + ' ' + $style.fieldBorder" v-text="data.url" />
                  <div>
                    <el-button type="text" @click="copy(data.url)">复制</el-button>
                    <!--<el-button type="text" @click="download(data.url, data.name)">下载</el-button>-->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import { download } from '../assets/js/util'
export default {
  name: 'File-Preview',
  data () {
    return {
      visibleContent: false,
      visibleBox: false,
      error: false
    }
  },
  props: {
    show: Boolean,
    data: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  watch: {
    show (val) {
      if (val) {
        this.visibleBox = val
        setTimeout(() => {
          this.visibleContent = val
        }, 200)
      } else {
        this.visibleContent = val
        setTimeout(() => {
          this.visibleBox = val
        }, 200)
      }
    }
  },
  mounted () {
    this.$refs.img.addEventListener('load', (e) => {
      this.error = false
      let img = e.target
      let w = img.width
      let h = img.height
      let r = w / h // 宽高比
      if (h > w) {
        img.style.width = 380 * r + 'px'
        img.style.height = '380px'
      } else {
        img.style.width = '440px'
        img.style.height = 440 / r + 'px'
      }
    })
    this.$refs.img.addEventListener('error', (e) => {
      this.error = true
    })
  },
  methods: {
    close () {
      this.$emit('update:show', false)
    },
    copy (url) {
      this.$copyText(url)
        .then(() => {
          this.$success('复制成功！')
        })
    },
    download (url, name) {
      download(url, name)
    },
    imgOnload (e) {
      let img = e.target
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w >= h) {
        img.style.width = '450px'
        img.style.height = 'auto'
      } else {
        img.style.height = '450px'
        img.style.width = 'auto'
      }
    }
  }
}
</script>

<style module lang="scss">
  .preview {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: rgba(0, 0, 0, .6);
  }
  .contentBox {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 500px;
    height: 100vh;
    background-color: #fff;
    box-shadow: -5px 0 10px rgba(0, 0, 0, .1);
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    line-height: 50px;
    border-bottom: 1px solid #e7e7e7;
    font-size: 16px;
    > i {
      padding: 4px;
      cursor: pointer;
    }
  }
  .content {
    padding: 20px;
  }
  .previewBox {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    height: 460px;
    background-color: #e7e7e7;
    > img {
      object-fit: cover;
    }
  }
  .detailInfo {
    margin-top: 10px;
    > .field {
      display: flex;
      font-size: 14px;
      margin-bottom: 14px;
      > .fieldname {
        display: inline-block;
        width: 100px;
      }
      > .fieldvalue {
        flex: 1;
      }
      .fieldBorder {
        display: inline-block;
        width: 100%;
        padding: 3px 6px;
        border: 1px solid #e7e7e7;
        font-size: 12px;
      }
    }
  }
</style>
