<template>
  <div :class="$style.icons">
    <div :class="$style.project">
      <div :class="$style.myProject">
        <div :class="$style.proTitle">
          <span>我的项目</span>
          <i class="el-icon-circle-plus-outline" :class="$style.edit" @click="addProject" />
        </div>

        <!-- 左侧项目列表 -->
        <ul :class="$style.projectList">
          <li
            v-for="(item, i) of projects"
            :class="{ [$style.active]: currentProjectId === item.id }"
            :key="i"
            @click="selectProject(item)"
          >
            <div>
              {{ item.name }}
            </div>
            <div v-if="item.id !== 'has_removed'">
              <i class="el-icon-edit" @click.stop="editProject(item)" />
              <i class="el-icon-delete" @click.stop="removeProject(item)" />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 右侧 -->
    <div :class="$style.iconsManage">
      <div :class="$style.proInfo">
        <div :class="$style.proName" v-if="currentProject.project_name" v-text="currentProject.project_name" />
        <div :class="$style.iconCount">
          <i v-text="icons.length" /> 个图标
        </div>
        <div :class="$style.updateTime" v-if="currentProject.update_time" >
          <i class="el-icon-time" /> <span v-text="currentProject.update_time" />
        </div>
      </div>

      <div :class="$style.controller">
        <el-button
          round
          type="primary"
          plain
          @click="isLinkShow = !isLinkShow"
        >
          {{ isLinkShow ? '收起在线链接' : '查看在线链接' }}
        </el-button>
        <el-button
          type="primary"
          icon="el-icon-upload2"
          round
          plain
          :disabled="projects.length === 0"
          @click="upload"
        >
          上传图标至项目
        </el-button>
        <el-button
            type="primary"
            icon="el-icon-download"
            round
            @click="downloadAll"
        >
          下载全部
        </el-button>
        <el-checkbox
          :class="$style.recycleBin"
          size="small"
          v-model="recycleBin"
          :disabled="projects.length === 0"
          @change="recycleBinOnChange"
        >
          回收站
        </el-checkbox>
      </div>

      <div v-if="currentProjectId !== 'has_removed'" v-show="isLinkShow">
        <div
          :class="$style.tip"
          v-if="isLinkChanged"
          @click="createLink"
        >
          <i class="el-icon-warning-outline" />
          下方新 icon 来袭，点击更新代码
        </div>
        <code
          :class="{
            [$style.link]: true,
            [$style.disabled]: isLinkChanged
          }"
          v-if="link"
          v-text="link"
        />
      </div>

      <ul :class="$style.iconList">
        <li
          :class="$style.iconItem"
          v-for="(item, i) of icons"
          :key="i"
        >
          <div :class="$style.svg" v-html="item.content" />
          <p :class="$style.svgDesc" v-text="item.icon_desc" />
          <p :class="$style.svgName" v-text="item.icon_name" />

          <div :class="$style.mask">
            <div>
              <el-tooltip class="item" effect="dark" content="删除" placement="top">
                <i class="el-icon-delete" @click="remove(item)" />
              </el-tooltip>
              <el-tooltip v-if="item.visible" class="item" effect="dark" content="重新上传" placement="top">
                <i class="el-icon-upload2" @click="reUpload(item)" />
              </el-tooltip>
              <el-tooltip v-if="!item.visible" class="item" effect="dark" content="还原" placement="left-start">
                <i class="el-icon-refresh-left" @click="update(item, { visible: 1 })" />
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="预览" placement="left-start">
                <i class="el-icon-full-screen" @click="preview(item)" />
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="下载" placement="right-end">
                <i class="el-icon-download" @click="download(item)" />
              </el-tooltip>
            </div>
            <button @click="copyCode(item)">复制代码</button>
          </div>
        </li>
      </ul>
    </div>

    <input
      ref="fileSelect"
      v-show="false"
      type="file"
      multiple
      accept="image/svg+xml"
      @change="fileChange"
    >

    <el-dialog
      :title="isDownloadAll ? '下载全部' : '下载'"
      :visible.sync="isDownloadModalShow"
      @close="downloadClose"
    >
      <div :class="$style.downloadWarp">
        <div id="download-svg-wrap" :class="$style.downloadSvgWrap" v-html="currentDownloadSvg.content" />
        <div class="controller">
          <div style="text-align: center;">
            <el-radio v-model="downloadType" :label="1" border>SVG</el-radio>
            <el-radio v-model="downloadType" :label="2" border>PNG</el-radio>
          </div>
          <div v-if="downloadType === 2" style="margin-top: 20px;">
            宽度：<el-input-number v-model="downloadWidth" :min="50" :max="5000" step-strictly :step="50" />
          </div>
          <div style="margin-top: 20px">
            <el-button v-if="!isDownloadAll" type="primary" icon="el-icon-download" @click="downloadFile">
              下载
            </el-button>
            <el-button v-if="isDownloadAll" :loading="isAutoDownloading" type="primary" @click="downloadAllFile">
              确定
            </el-button>
            <el-button v-if="isDownloadAll" type="primary" @click="cancelDownloadAll">
              取消下载
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <div
      :class="$style.svgPreivew"
      v-show="isPreviewerShow"
      v-html="currentPreviewSvg"
      @click="isPreviewerShow = false"
    />
  </div>
</template>

<script>
import {
  getProjects,
  createProject,
  removeProject,
  updateProject
} from '../apis/project'
import {
  getLink,
  createLink
} from '../apis/link'
import {
  getIcons,
  upload,
  remove,
  updateIcons
} from '../apis/icons'

export default {
  name: 'Icons',
  props: {
    projectId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      projects: [],
      icons: [],
      currentProjectId: '',
      recycleBin: false,
      link: '',
      isLinkShow: true,
      isLinkChanged: false,
      isDownloadModalShow: false,
      isDownloadAll: false,
      isAutoDownloading: false,
      currentDownloadSvg: {},
      // 下载类型
      downloadType: 1,
      // 下载的图片宽度
      downloadWidth: 150,
      currentPreviewSvg: '',
      isPreviewerShow: false,
      iconsForm: {
        visible: 1,
        projectId: ''
      }
    }
  },
  computed: {
    currentProject () {
      return this.projects.find(item => item.id === this.currentProjectId) || {}
    }
  },
  async activated () {
    try {
      await this.init()
    } catch (e) {
      throw e
    }
  },
  methods: {
    async init () {
      try {
        if (this.projectId) {
          this.currentProjectId = this.projectId
          this.iconsForm.projectId = this.projectId
          await this.getProjects()
          await this.getIcons()
          await this.getLink()
        } else {
          await this.getProjects()
          if (!this.currentProjectId && this.projects[0]) {
            this.currentProjectId = this.projects[0].id
          }
          this.iconsForm.projectId = this.currentProjectId
          await this.$router.push({
            name: 'Icons',
            params: {
              projectId: this.iconsForm.projectId
            }
          })
        }
      } catch (e) {
        throw e
      }
    },
    async getProjects () {
      try {
        let { result } = await getProjects()
        this.projects = result
      } catch (e) {
        throw e
      }
    },
    async getIcons () {
      try {
        let { result } = await getIcons(this.iconsForm)
        this.icons = result.list
        this.isLinkChanged = result.changed
      } catch (e) {
        throw e
      }
    },
    async getLink () {
      try {
        const { result = {} } = await getLink(this.currentProjectId)
        this.link = result.link || ''
      } catch (e) {
        throw e
      }
    },
    async createLink () {
      try {
        await createLink(this.currentProjectId)
        await this.getLink()
        await this.getIcons()
      } catch (e) {
        throw e
      }
    },
    async addProject () {
      let val = ''
      try {
        const { value } = await this.$prompt('请输入项目名称')
        val = value
      } catch (e) {
        return
      }

      try {
        await createProject({ name: val })
        await this.init()
      } catch (e) {
        throw e
      }
    },
    async editProject (item) {
      let name = ''
      try {
        const { value } = await this.$prompt({
          title: '请输入项目名称',
          inputValue: item.name
        })
        name = value
      } catch (e) {
        return
      }

      try {
        const { result } = await updateProject(item.id, { name })
        this.$success('修改成功')
        const index = this.projects.findIndex(pro => pro.id === item.id)
        this.projects.splice(index, 1, result)
      } catch (e) {
        throw e
      }
    },
    async removeProject (item) {
      try {
        await this.$confirm({
          message: '删除后，该项目下的图标将移至“已删除项目的图标”下',
          title: '确定删除？',
          type: 'warning'
        })
        await removeProject(item.id)
        let index = this.projects.findIndex(pro => pro.id === item.id)
        this.projects.splice(index, 1)

        if (this.currentProjectId === item.id) {
          this.currentProjectId = this.projects[0] ? this.projects[0].id : ''
        }
        await this.getIcons()
        await this.getLink()
      } catch (e) {
        throw e
      }
    },
    async selectProject ({ id }) {
      if (this.currentProjectId === id) return

      this.currentProjectId = id
      this.iconsForm.projectId = id
      this.iconsForm.visible = 1
      this.recycleBin = false
      await this.$router.push({ name: 'Icons', params: { projectId: id } })
    },
    upload () {
      this.$refs.fileSelect.click()
    },
    async fileChange (e) {
      const files = Array.from(e.target.files)
      const data = {
        projectId: this.currentProjectId,
        id: this.isReUploadId ? this.isReUploadId : ''
      }

      for (let [i, file] of files.entries()) {
        data[`file${i}`] = file
      }

      await upload(data)
      this.isReUploadId = ''
      await this.getIcons()
    },
    /**
     * 修改图标
     * @param item {object} 当前图标
     * @param fields {object} 要更新的字段
     */
    async update (item, fields) {
      try {
        await updateIcons(item.id, fields)
        await this.getIcons()
      } catch (e) {
        throw e
      }
    },
    async remove (item) {
      try {
        await this.$confirm({
          type: 'warning',
          title: '确定删除吗？',
          message: item.visible ? '删除后可在回收站中找回' : '删除后不可恢复！'
        })
        if (!item.visible) {
          // 真删
          await remove(item.id)
          await this.getIcons()
        } else {
          // 假删
          await this.update(item, { visible: 0 })
        }
      } catch (e) {
        throw e
      }
    },
    /**
     * 重新上传
     */
    reUpload (item) {
      this.isReUploadId = item.id
      this.upload()
    },
    // 预览
    preview (item) {
      this.isPreviewerShow = true
      this.currentPreviewSvg = item.content
    },
    download (item) {
      this.isDownloadModalShow = true
      this.currentDownloadSvg = item
    },
    downloadAll () {
      this.isDownloadModalShow = true
      this.isDownloadAll = true
    },
    async downloadFile () {
      // TODO: 为什么下载时要加xmlns
      // svgBolb: Blob {size: 2570, type: "image/svg+xml"}
      const svgBolb = new Blob([this.currentDownloadSvg.content.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"')], { type: 'image/svg+xml' })

      // createObjectURL 创建一个 DOMString
      // URL："blob:http://localhost:8001/a07f9466-1980-475b-9bfe-47dd92f16c18"
      const URL = window.webkitURL.createObjectURL(svgBolb)

      // await this.$nextTick()

      const a = document.createElement('a')
      const downloadSvgWrap = document.getElementById('download-svg-wrap')
      const svgWidth = downloadSvgWrap.offsetWidth
      const svgHeight = downloadSvgWrap.offsetHeight
      const ratio = svgHeight / svgWidth

      if (this.downloadType === 1) {
        // 下载svg

        a.href = URL
        a.download = this.currentDownloadSvg.icon_desc
        a.click()
      } else if (this.downloadType === 2) {
        // 下载png
        const canvas = document.createElement('canvas')
        const img = document.createElement('img')
        const ctx = canvas.getContext('2d')
        img.width = canvas.width = this.downloadWidth
        img.width = canvas.height = ratio * this.downloadWidth
        img.src = URL

        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          // 创造Blob对象，用以展示canvas上的图片；这个图片文件可以被缓存或保存到本地
          canvas.toBlob(blob => {
            a.href = window.webkitURL.createObjectURL(blob)
            a.download = this.currentDownloadSvg.icon_desc
            a.click()
          })
        }
      }
    },
    // 启动下载全部文件
    downloadAllFile () {
      const iterator = this.icons[Symbol.iterator]()
      this.isAutoDownloading = true

      this.autoDownloadTimer = setInterval(() => {
        const item = iterator.next().value
        if (item) {
          this.currentDownloadSvg = item
          this.downloadFile()
        } else {
          this.cancelDownloadAll()
        }
      }, 500)
    },
    cancelDownloadAll () {
      clearInterval(this.autoDownloadTimer)
      this.isDownloadModalShow = false
    },
    downloadClose () {
      this.isDownloadAll = false
      this.isAutoDownloading = false
      this.currentDownloadSvg = {}
    },
    copyCode (item) {
      this.$copyText(item.icon_name)
        .then(val => {
          this.$success('复制成功')
        }).catch(e => {
          this.$error(`复制成功失败，请手动复制`)
        })
    },
    recycleBinOnChange (val) {
      this.iconsForm.visible = val ? 0 : 1
      this.getIcons()
    }
  },
  async beforeRouteUpdate (to, from, next) {
    await next()
    this.currentProjectId = this.projectId
    this.iconsForm.projectId = this.currentProjectId
    this.isAutoDownloading = false
    this.isDownloadAll = false
    this.isDownloadModalShow = false
    this.currentDownloadSvg = {}
    this.getIcons()
    this.getLink()
  }
}
</script>

<style module lang="scss">
  .icons {
    display: flex;
    justify-content: flex-start;
    padding: 30px 300px;
  }
  .myProject {
    width: 160px;
    padding-right: 20px;
    border-right: 1px solid #e7e7e7;
    > .proTitle {
      margin-bottom: 12px;
      font-size: 14px;
      color: #999;

      > .edit {
        float: right;
        font-size: 16px;
        cursor: pointer;
        &:hover {
          color: #fe7b21;
        }
      }
    }
  }
  .projectList {
    > li {
      position: relative;
      display: flex;
      justify-content: space-between;
      padding: 10px 0 10px 10px;
      color: #999;
      font-size: 12px;
      cursor: pointer;
      > div {
        line-height: 16px;
        > i {
          margin-left: 5px;
          &:hover {
            color: #fe7b21;
          }
        }
      }
      &.active {
        color: #333;
        &:before {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          content: '';
          height: 15px;
          width: 2px;
          background-color: #fe7b21;
        }
      }
    }
  }
  .iconsManage {
    flex: 1;
    padding: 0 20px;
  }
  .proInfo {
    display: flex;
    align-items: baseline;
    .proName {
      margin-right: 35px;
      line-height: 30px;
      font-size: 20px;
    }
    .iconCount {
      margin-right: 35px;
      font-size: 14px;
      color: #999;
      > i {
        color: red;
      }
    }
    .updateTime {
      margin-right: 35px;
      font-size: 14px;
      color: #999;
      > i {
        font-size: 16px;
      }
    }
  }
  .controller {
    display: flex;
    align-items: center;
    margin-top: 20px;

    .recycleBin {
      margin-left: 20px;
    }
  }
  .iconList {
    display: grid;
    grid-template-columns: repeat(8, 140px);
    grid-gap: 18px 8px;
    width: 100%;
    height: max-content;
    margin-top: 20px;
  }
  .iconItem {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 12px 8px;
    border-radius: 10px;
    border: 1px solid #e7e7e7;
    background-color: #abc;
    > .svg {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100px;
      padding: 20px 0;
      > svg {
        width: 80px;
        height: 80px;
      }
    }
    &:hover {
      .mask {
        display: flex;
      }
    }
  }
  .mask {
    position: absolute;
    left: 0;
    top: 0;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, .8);
    > div {
      display: grid;
      grid-template-columns: repeat(2, 45px);
      grid-template-rows: repeat(2, 45px);
      justify-content: space-around;
      > i {
        display: inline-block;
        line-height: 45px;
        text-align: center;
        font-size: 20px;
        color: #ddd;
        cursor: pointer;
        &:hover {
          color: #fe7b21;
          background-color: rgba(255, 255, 255, .2);
        }
      }
    }
    > button {
      line-height: 40px;
      font-size: 14px;
      color: #fff;
      &:hover {
        color: #fe7b21;
        background-color: rgba(255, 255, 255, .2);
      }
    }
  }
  .svgDesc {
    font-size: 12px;
    color: #666;
    line-height: 16px;
    text-align: center;
  }
  .svgName {
    width: 100%;
    margin-top: 6px;
    font-size: 12px;
    color: #666;
    line-height: 16px;
    text-align: center;
    @include elps();
  }
  .tip {
    margin-top: 20px;
    color: red;
    font-size: 12px;
    cursor: pointer;
    > i {
      font-size: 14px;
    }
  }
  .link {
    display: block;
    margin-top: 20px;
    padding: 0 10px;
    font-size: 12px;
    line-height: 40px;
    color: #666;
    background-color: #efefef;
    border-radius: 3px;
    &.disabled {
      user-select: none;
      color: #ccc;
    }
  }
  .svgPreivew {
    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgba(170, 187, 204, .8);
    z-index: 1;
    > svg {
      width: 200px;
      height: 200px;
    }
  }
  .downloadWarp {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    > .downloadSvgWrap {
      width: max-content;
      margin-right: 30px;
      background-color: #aabbcc;
      > svg {
        width: 300px;
      }
    }
  }
</style>
