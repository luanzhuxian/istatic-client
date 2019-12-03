import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '雅集图标管理系统'
    }
  },
  {
    path: '/icons/:projectId',
    name: 'Icons',
    component: () => import('../views/Icons.vue'),
    props: true,
    meta: {
      title: '我的图标'
    }
  },
  {
    path: '/images',
    name: 'Images',
    component: () => import('../views/Image.vue'),
    meta: {
      title: '我的图片'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
