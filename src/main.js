import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import filters from './filter'
import VueClipboard from 'vue-clipboard2'

import './assets/scss/index.scss'
import './assets/js/el-components.js'
import './assets/scss/element-variables.scss'
import 'viewerjs/dist/viewer.css'
import Vuer from 'v-viewer'
Vue.use(Vuer, { name: 'vuer' })
Vue.use(VueClipboard)
VueClipboard.config.autoSetContainer = true

Vue.config.productionTip = false

for (const k of Object.keys(filters)) {
  Vue.filter(k, filters[k])
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

router.beforeResolve(function (to, from, next) {
  document.title = to.meta.title
  next()
})
// 路由导航出错时的回调
router.onError(function (err) {
  console.error(err)
})

// Vue.config.errorHandler = function (err, vm, info) {
//     if (err) {
//         if (err.name === 'ResponseError') {
//             // 响应出错
//             const error = JSON.parse(err.message)
//             vm.$error(error.message)
//         }
//         console.error(err)
//     }
// }
