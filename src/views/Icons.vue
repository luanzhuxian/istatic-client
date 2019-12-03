<template>
  <div :class="$style.icons">
    <div :class="$style.project">
      <div :class="$style.myProject">
        <div :class="$style.proTitle">
          <i class="el-icon-circle-plus-outline" :class="$style.edit" @click="addProject" />
          我的项目
        </div>

        <ul :class="$style.projectList">
          <li
            v-for="(item, i) of projects"
            :class="{ [$style.active]: currentProjectId === item.id }"
            :key="i"
            @click="changeProject(item)"
          >
            <div>
              {{ item.name }}
            </div>
            <div>
              <i @click.stop="editPro(item)" class="el-icon-edit"></i>
              <i @click.stop="delPro(item)" class="el-icon-delete"></i>
            </div>
          </li>
        </ul>
      </div>
    </div>

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
          @click="see = !see"
        >
          {{ see ? '收起在线链接' : '查看在线链接' }}
        </el-button>
        <el-button
          round
          type="primary"
          plain
          icon="el-icon-upload2"
          @click="upload"
          :disabled="projects.length === 0"
        >
          上传图标至项目
        </el-button>
        <el-checkbox
          size="small"
          :class="$style.recycleBin"
          v-model="recycleBin"
          @change="changeRecycle"
          :disabled="projects.length === 0"
        >
          回收站
        </el-checkbox>
      </div>

      <div v-show="see">
        <div :class="$style.tip" v-if="changed" @click="createLink">
          <i class="el-icon-warning-outline" />
          下方新 icon 来袭，点击更新代码
        </div>
        <code
          :class="{
            [$style.link]: true,
            [$style.disabled]: changed
          }"
          v-if="link"
          v-text="link"
        />
      </div>

      <ul
        :class="$style.iconList">
        <li
          v-for="(item, i) of icons"
          :key="i"
          :class="$style.iconItem"
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
                <i class="el-icon-refresh-left" @click="updateIcons(item, { visible: 1 })" />
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="预览" placement="left-start">
                <i class="el-icon-refresh-left" @click="preview(item)" />
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

    <div @click="showSvgPreview = false" :class="$style.svgPreivew" v-show="showSvgPreview" v-html="previewSvg" />
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
  data () {
    return {
      projects: [],
      icons: [],
      currentProjectId: '',
      recycleBin: false,
      see: true,
      showSvgPreview: false,
      changed: false,
      link: '',
      previewSvg: '',
      iconsForm: {
        visible: 1,
        projectId: ''
      }
    }
  },
  props: {
    projectId: {
      type: String,
      default: ''
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
        await this.getProjects()
        if (this.projectId) {
          this.iconsForm.projectId = this.projectId
          this.currentProjectId = this.projectId
          await this.getIcons()
          await this.getLink()
        } else {
          await this.$router.push({ name: 'Icons', params: { projectId: this.iconsForm.projectId } })
        }
      } catch (e) {
        throw e
      }
    },
    async getProjects () {
      try {
        let { result } = await getProjects()
        this.projects = result
        this.currentProjectId = this.currentProjectId ? this.currentProjectId : result[0] ? result[0].id : ''
        this.iconsForm.projectId = this.currentProjectId
      } catch (e) {
        throw e
      }
    },
    async getIcons () {
      try {
        let { result } = await getIcons(this.iconsForm)
        this.icons = result.list
        this.changed = result.changed
      } catch (e) {
        throw e
      }
    },
    async getLink () {
      try {
        let { result } = await getLink(this.currentProjectId)
        this.link = result ? result.link : ''
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
    async delPro (item) {
      try {
        await this.$confirm({
          message: '确定删除？',
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
    async editPro (item) {
      try {
        const { value } = await this.$prompt({
          title: '请输入项目名称',
          inputValue: item.name
        })
        item.name = value
      } catch (e) {
        return
      }
      try {
        await updateProject(item.id, { name: item.name })
        let index = this.projects.findIndex(pro => pro.id === item.id)
        this.projects.splice(index, 1, item)
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
    async changeProject (pro) {
      if (this.currentProjectId === pro.id) return
      this.currentProjectId = pro.id
      this.iconsForm.projectId = pro.id
      this.recycleBin = false
      this.iconsForm.visible = 1
      await this.$router.push({ name: 'Icons', params: { projectId: pro.id } })
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
    async updateIcons (item, fields) {
      try {
        await updateIcons(item.id, fields)
        await this.getIcons()
      } catch (e) {
        throw e
      }
    },
    // 预览
    preview (item) {
      this.showSvgPreview = true
      this.previewSvg = item.content
    },
    /**
     * 重新上传
     */
    reUpload (item) {
      this.upload()
      this.isReUploadId = item.id
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
          await this.updateIcons(item, { visible: 0 })
        }
      } catch (e) {
        throw e
      }
    },
    copyCode (item) {
      this.$copyText(item.icon_name)
        .then(val => {
          this.$success('复制成功')
        }).catch(e => {
          this.$error(`复制成功失败，请手动复制`)
        })
    },
    changeRecycle (val) {
      this.iconsForm.visible = val ? 0 : 1
      this.getIcons()
    }
  },
  async beforeRouteUpdate (to, from, next) {
    await next()
    this.currentProjectId = this.projectId
    this.iconsForm.projectId = this.currentProjectId
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
  .project {
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
    background-color: rgba(0, 0, 0, .8);
    z-index: 1;
    > svg {
      width: 200px;
      height: 200px;
    }
  }
</style>
