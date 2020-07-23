<template>
  <div class="test">
      <div class="control-panel">
        <el-button
          type="primary"
          icon="el-icon-upload2"
          round
          plain
          @click="select"
        >
          选择图片
        </el-button>
        <input
            ref="input"
            v-show="false"
            type="file"
            multiple
            accept="image/png, image/jpeg"
            @change="onChange"
          >
      </div>
      <ul class="img-list">
          <li v-for="(item, index) of list" :key="index">
              <img :src="item.content" :alt="item.name">
              <span>{{ item.content }}</span>
              <div class="btn-group">
                <el-button plain @click="copy(item.content)">复制base64</el-button>
                <el-button plain @click="save(item)">保存到服务器</el-button>
              </div>
          </li>
      </ul>
  </div>
</template>

<script>
import fetch from '../assets/js/fetch-config'

export default {
  name: 'Test',
  data () {
    return {
      list: []
    }
  },
  async created () {
    try {
      await this.getImages()
    } catch (error) {
      throw error
    }
  },
  methods: {
    async getImages () {
      try {
        const { result } = await fetch.get('api/convert')
        this.list = result
      } catch (error) {
        throw error
      }
    },
    select () {
      this.$refs.input.click()
    },
    async onChange (e) {
    //   console.log(e)
      const files = Array.from(e.target.files)
      const data = {}

      for (const [i, file] of files.entries()) {
        data[i] = file
      }

      try {
        const { result } = await fetch.post('api/convert', data, { type: 'FormData' })
        console.log(result)
        this.$success('转换成功')
        await this.getImages()
      } catch (error) {
        throw error
      }
    },
    copy (text) {
      this.$copyText(text)
        .then(val => {
          this.$success('复制成功')
        }).catch(e => {
          this.$error(`复制成功失败，请手动复制`)
        })
    },
    async save ({ content, name }) {
      try {
        await fetch.post('api/convert/save', { content, name })
        this.$success('保存成功')
      } catch (error) {
        throw error
      }
    }
  }
}
</script>

<style lang="scss">
.test {
    padding: 30px 300px;
    .img-list {
        margin-top: 30px;
        > li {
            display: flex;
            align-items: center;
            > img {
                width: 300px;
                height: auto;
                object-fit: cover;
            }
            > span {
                margin: 0 10px;
                flex: 1;
                width: 0;
                max-height: 300px;
                overflow-y: scroll;
            }
            > .btn-group {
                display: flex;
                flex-direction: column;
                align-items: center;
                > .el-button {
                    margin-left: 0;
                }
            }
            & + li {
                margin-top: 20px;
            }
        }
    }
}

</style>
