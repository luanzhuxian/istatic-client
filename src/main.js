import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueClipboard from 'vue-clipboard2'

import './assets/scss/index.scss'
import './assets/js/el-components.js'
import './assets/scss/element-variables.scss'

Vue.use(VueClipboard)
VueClipboard.config.autoSetContainer = true

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

router.beforeResolve(function (to, from, next) {
  document.title = to.meta.title
  next()
})
