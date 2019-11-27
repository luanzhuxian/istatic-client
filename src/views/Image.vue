<template>
  <div :class="$style.image">
    <el-form inline size="mini">
      <el-form-item>
        <el-button type="primary">上传文件</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">新建目录</el-button>
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
            <i class="el-icon-document" />
            <a :class="$style.filename" v-text="item.name" @click="fileClick(item)" />
            <span :class="$style.size">{{(item.size / 1024).toFixed(4)}}KB</span>
            <span :class="$style.datetime">{{item.lastModified}}</span>
            <el-button type="text" @click="copy(item.url)">复制链接</el-button>
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
import FilePreview from '../components/File-Preview.vue'
import { getFiles } from '../apis/oss'
export default {
  name: 'Image',
  components: {
    FilePreview
  },
  data () {
    return {
      credentials: null,
      showPreview: false,
      prefixes: [],
      files: [],
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
        this.files = result.files
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
    grid-template-columns: 20px 500px 150px 150px auto;
    align-items: center;
    justify-content: start;
    line-height: 30px;
    padding: 0 10px;
    font-size: 12px;
    &:hover {
      background-color: #efefef;
    }
    > i {
      font-size: 18px;
      color: #0eb2cc;
    }
    > .filename {
      padding: 0 10px;
      color: #0070cc;
      @include elps();
    }
    > .size {
    }
  }
</style>
