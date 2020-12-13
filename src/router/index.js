import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '图标管理系统'
    }
  },
  {
    path: '/icons/:projectId?',
    name: 'Icons',
    component: () => import('../views/Icons.vue'),
    props: true,
    meta: {
      title: '我的图标'
    }
  },
  {
    path: '/images/:path?',
    name: 'Images',
    props: true,
    component: () => import('../views/File-Manager.vue'),
    meta: {
      title: '文件管理'
    }
  },
  {
    path: '/helper',
    name: 'Helper',
    redirect: '/helper/code',
    component: () => import('../views/Helper.vue'),
    meta: {
      title: '帮助文档'
    },
    children: [
      {
        path: 'code',
        name: 'CodeHelper',
        component: () => import('../views/Code-Helper.vue'),
        meta: {
          title: '代码应用'
        }
      }
    ]
  },
  {
    path: '/test',
    name: 'Test',
    props: true,
    component: () => import('../views/Test.vue'),
    meta: {
      title: '随便玩玩'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
