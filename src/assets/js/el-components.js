/* 导入需要的 element-ui 组件 */
/* eslint-disable */
import Vue from 'vue'
import ElementUI from 'element-ui'
Vue.use(ElementUI)
const {
  Loading,
  MessageBox,
  Message
} = ElementUI
Vue.prototype.$loading = Loading.service
Vue.prototype.$msgbox = MessageBox
/*
* 在不改变原来用法的情况下，进一步封装MessageBox，以便统一管理
* 设置 type 默认值
* 设置 title 默认值
*/
Vue.prototype.$alert = async (config = {}) => {
  let configDefault = {
    title: '',
    message: '',
    confirmButtonText: '确定',
    closeOnClickModal: false
  }
  if (typeof config === 'string') {
    configDefault.title = config
  }
  if (typeof config === 'object') {
    Object.assign(configDefault, config)
  }
  try {
    await MessageBox(configDefault)
  } catch (e) {
    throw e
  }
}
Vue.prototype.$confirm = async (config = {}) => {
  let configDefault = {
    title: '',
    message: '',
    cancelButtonText: '取消',
    confirmButtonText: '确定',
    showCancelButton: true,
    showInput: false,
    closeOnClickModal: false
  }
  if (typeof config === 'string') {
    configDefault.title = config
  }
  if (typeof config === 'object') {
    Object.assign(configDefault, config)
  }
  try {
    await MessageBox(configDefault)
  } catch (e) {
    throw e
  }
}
Vue.prototype.$prompt = async (config = {}) => {
  let configDefault = {
    title: '',
    message: '',
    inputType: 'text',
    cancelButtonText: '取消',
    confirmButtonText: '确定',
    showCancelButton: true,
    showInput: true,
    closeOnClickModal: false
  }
  if (typeof config === 'string') {
    configDefault.title = config
  }
  if (typeof config === 'object') {
    Object.assign(configDefault, config)
  }
  try {
    await MessageBox(configDefault)
  } catch (e) {
    throw e
  }
}

Vue.prototype.$notify = Notification
Vue.prototype.$success = msg => {
  const vm = Message.success({
    customClass: 'iconfont icon-chenggong',
    message: msg,
    duration: 3000
  })
  // 鼠标悬停时，不让它关闭定时器
  vm.clearTimer = () => {}
}
Vue.prototype.$error = msg => {
  const vm = Message.error({
    customClass: 'iconfont icon-shibai',
    message: msg,
    duration: 3000
  })
  // 鼠标悬停时，不让它关闭定时器
  vm.clearTimer = () => {}
}
Vue.prototype.$warning = msg => {
  const vm = Message.warning({
    customClass: 'iconfont icon-jinggao',
    message: msg,
    duration: 3000
  })
  // 鼠标悬停时，不让它关闭定时器
  vm.clearTimer = () => {}
}
Vue.prototype.$info = Message.info
Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 }
