<template>
  <div :class="$style.image">
    <el-form inline size="mini">
      <el-form-item>
        <el-button @click="selectFile" type="primary">上传文件</el-button>
        <input ref="input" v-show="false" type="file" multiple @change="fileChange">
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createDir">新建目录</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="getFiles">刷新</el-button>
      </el-form-item>
    </el-form>

    <div :class="$style.fileList">
      <div :class="$style.history">
        <el-button size="middle" type="text" @click="history(0, '')">. /</el-button>
        <template v-for="(item, i) of dir.split('/')">
          <el-button
            v-if="item"
            :key="i"
            type="text"
            size="middle"
            @click="history(i + 1, item)"
            :disabled="i === dir.split('/').length - 2"
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
            <img v-else v-viewer="{ url: item.url }" :src="item.url + '?x-oss-process=style/thum-mini'" @load="imgOnload" alt="">
            <a :class="$style.filename" v-text="item.name" @click="fileClick(item)" />
            <span :class="$style.size">{{(item.size / 1024).toFixed(4)}}KB</span>
            <span :class="$style.datetime">{{item.lastModified}}</span>
            <div>
              <el-button type="text" @click="copy(item.url)">复制链接</el-button>
              <el-button type="text" @click="remove(item)">删除</el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <FilePreview
      :show.sync="showPreview"
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
      showPreview: false,
      prefixes: [],
      files: [],
      images: [],
      currentFile: {},
      dir: ''
    }
  },
  async activated () {
    try {
      await this.getFiles()
    } catch (e) {
      throw e
    }
  },
  methods: {
    async getFiles () {
      try {
        const { result } = await getFiles(this.dir)
        this.prefixes = result.prefixes
        result.files.sort((a, b) => {
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        })
        this.files = result.files
        for (let f of this.files) {
          if (f.url.match(/jpg|png|gif|jpeg|bmp/i)) {
            this.images.push(f)
          }
        }
        // this.dir = result.dir
      } catch (e) {
        throw e
      }
    },
    async clickDir (prefixe) {
      this.dir += prefixe
      try {
        await this.getFiles()
      } catch (e) {
        throw e
      }
    },
    history (index) {
      let dirArr = this.dir.split('/')
      dirArr.splice(index, 100)
      this.dir = dirArr.join('/') ? dirArr.join('/') + '/' : ''
      this.getFiles()
    },
    fileClick (item) {
      this.showPreview = true
      this.currentFile = item
    },
    copy (url) {
      this.$copyText(url)
        .then(() => {
          this.$success('复制成功！')
        })
    },
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
    selectFile () {
      this.$refs.input.click()
    },
    async fileChange (e) {
      const files = Array.from(e.target.files)
      const data = {}
      for (let [i, file] of files.entries()) {
        data[`file${i}`] = file
      }
      try {
        await uploadFiles(this.dir, data)
        await this.getFiles()
      } catch (e) {
        throw e
      }
    },
    async createDir () {
      try {
        const { value } = await this.$prompt('请输入目录名称')
        await createDir(value, this.dir)
        await this.getFiles()
      } catch (e) {
        if (e !== 'cancel') {
          throw e
        }
      }
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
    > .history {
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
