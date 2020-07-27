<template>
  <div :class="$style.image">
    <el-form inline size="mini">
      <el-form-item>
        <el-button @click="upload" type="primary">上传文件</el-button>
        <input ref="input" v-show="false" :type="type" multiple @change="onFileChange">
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createDir">新建目录</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="getFiles">刷新</el-button>
      </el-form-item>
    </el-form>

    <div :class="$style.fileList">
      <div :class="$style.path">
        <el-button size="middle" type="text" @click="clickPath(0, '')">. /</el-button>
        <template v-for="(item, i) of dir.split('/')">
          <el-button
            v-if="item"
            :key="i"
            type="text"
            size="middle"
            :disabled="i === dir.split('/').length - 2"
            @click="clickPath(i + 1, item)"
          >
            {{ item + (i === dir.split('/').length - 2 ? '' : '/') }}
          </el-button>
        </template>
      </div>
      <div :class="$style.dirList">
        <div
          :class="$style.dir"
          v-for="item of prefixes"
          :key="item"
        >
          <i class="el-icon-folder-opened" />
          <a @click="clickDir(item)" v-text="item" />
        </div>
      </div>

      <div :class="$style.files" v-if="files.length">
        <div :class="$style.file">
          <i />
          <!--<span />-->
          <span :class="$style.filename">文件名称</span>
          <span :class="$style.size">文件大小</span>
          <span :class="$style.size">更新时间</span>
          <span :class="$style.size">操作</span>
        </div>
        <template v-for="(item, i) of files">
          <div
            :class="$style.file"
            v-if="item.name"
            :key="i"
          >
            <i v-if="!item.url.match(/jpg|png|gif|jpeg|bmp/i)" class="el-icon-document" />
            <img v-else v-viewer="{ url: 'data-big' }" :data-big="item.url" :src="item.url + '?x-oss-process=style/thum-mini'" @load="imgOnload" alt="">
            <a :class="$style.filename" v-text="item.name" @click="preview(item)" />
            <span :class="$style.size">{{(item.size / 1024).toFixed(4)}}KB</span>
            <span :class="$style.datetime">{{item.lastModified}}</span>
            <div>
              <el-button type="text" @click="copyURL(item.url)">复制链接</el-button>
              <el-button type="text" @click="remove(item)">删除</el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <FilePreview
      :show.sync="isPreviewerShow"
      :data="currentFile"
    />
  </div>
</template>

<script>
/* eslint-disable */
import FilePreview from '../components/File-Preview.vue'
import { getFiles, uploadFiles, createDir, removeFile } from '../apis/oss'
export default {
  name: 'FileManager',
  components: {
    FilePreview
  },
  data () {
    return {
      credentials: null,
      isPreviewerShow: false,
      prefixes: [],
      files: [],
      images: [],
      currentFile: {},
      dir: '',
      type: 'file'
    }
  },
  props: {
    path: {
      type: String,
      default: ''
    },
  },
  async activated () {
    try {
      this.dir = this.path.replace(/_/g, '/')
      await this.getFiles()
    } catch (e) {
      throw e
    }
  },
  methods: {
    async getFiles () {
      try {
        const { result } = await getFiles(this.dir)
        result.files.sort((a, b) => {
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        })
        this.files = result.files
        this.prefixes = result.prefixes
        // this.dir = result.dir

        for (let file of this.files) {
          if (file.url.match(/jpg|png|gif|jpeg|bmp/i)) {
            this.images.push(file)
          }
        }
      } catch (e) {
        throw e
      }
    },
    upload () {
      this.$refs.input.click()
    },
    async onFileChange (e) {
      const files = Array.from(e.target.files)
      const data = {}

      for (let [i, file] of files.entries()) {
        data[`file${i}`] = file
      }

      try {
        this.type = 'text'
        await uploadFiles(this.dir, data)
        await this.getFiles()
      } catch (e) {
        throw e
      } finally {
        this.type = 'file'
      }
    },
    // TODO:
    // item.key: static/wwec2020123.jpg
    // encodeURIComponent(item.key) => static%2F820%2Fwwec2020123.jpg
    // item.key: static/wwec图片大会.jpg
    // encodeURIComponent(item.key) => static%2Fadmall%2Fskin%2Fwwec%E5%9B%BE%E7%89%87%E5%A4%A7%E4%BC%9A.jpg
    async remove (item) {
      try {
        await this.$confirm({ title: '温馨提示', type: 'warning', message: '你确定删除吗？' })
        await this.$confirm({ title: '温馨提示', type: 'warning', message: '你再确定一遍' })
        await this.$confirm({ title: '温馨提示', type: 'warning', message: '删了就没有了，你再确定一下' })
        await removeFile(encodeURIComponent(item.key))
        this.$success('删除成功')
        this.getFiles()
      } catch (e) {
        if (e) throw e
      }
    },
    async createDir () {
      try {
        const { value } = await this.$prompt('请输入目录名称')

        if (!/^[A-Za-z0-9.\-]+$/.test(value)) {
          this.$warning('文件夹名称只能包含数字，字母，点和中划线')
          return
        }

        await createDir(value, this.dir)
        await this.getFiles()
      } catch (e) {
        if (e !== 'cancel') {
          throw e
        }
      }
    },
    async clickPath (index) {
      let dirArr = this.dir.split('/')
      dirArr.splice(index, 100)
      this.dir = dirArr.join('/') ? dirArr.join('/') + '/' : ''

      if (this.dir) {
        this.$router.push({ name: 'Images', params: { path: this.dir.replace(/\//g, '_') } })
      } else {
        this.$router.push({ name: 'Images' })
      }

      try {
        await this.getFiles()
      } catch (e) {
        throw e
      }
    },
    async clickDir (prefix) {
      this.dir += prefix
      this.$router.push({ name: 'Images', params: { path: this.dir.replace(/\//g, '_') } })

      try {
        await this.getFiles()
      } catch (e) {
        throw e
      }
    },
    preview (item) {
      this.isPreviewerShow = true
      this.currentFile = item
    },
    copyURL (url) {
      this.$copyText(url)
        .then(() => {
          this.$success('复制成功！')
        })
    },
    imgOnload (e) {
      let img = e.target
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w >= h) {
        img.style.width = '80px'
        img.style.height = 'auto'
      } else {
        img.style.height = '80px'
        img.style.width = 'auto'
      }
    }
  }
}
</script>

<style module lang="scss">
  .image {
    padding: 30px 300px;
    > form {
      border-bottom: 1px solid #e7e7e7;
    }
  }
  .fileList {
    padding: 20px 0;
    > .path {
      color: #598bf8;
      margin-bottom: 10px;
      button {
        margin-left: 2px;
      }
    }
  }
  .dirList {
    line-height: 30px;
  }
  .dir {
    > i {
      color: #ffcb03;
      font-size: 24px;
      margin-right: 10px;
      vertical-align: -4px;
    }
    > a {
      color: #598bf8;
    }
  }
  .files {
    margin-top: 10px;
  }
  .file {
    display: grid;
    grid-template-columns: 100px 500px 150px 150px auto;
    align-items: center;
    justify-content: start;
    margin: 10px 0;
    line-height: 30px;
    padding: 0 10px;
    font-size: 12px;
    &:hover {
      background-color: #efefef;
    }
    > i {
      justify-self: center;
      font-size: 18px;
      color: #0eb2cc;
    }
    > .filename {
      padding: 0 10px;
      color: #0070cc;
      @include elps();
    }
    > img {
      /*width: 80px;*/
      /*height: 80px;*/
      justify-self: center;
      object-fit: cover;
    }
    > .size {
    }
  }
</style>
