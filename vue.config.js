const MODEL = process.argv[process.argv.indexOf('--model') + 1]
const NODE_ENV = process.env.NODE_ENV
/* ********************************************* 环境 *************************************** */
console.log('------------------------- ' + NODE_ENV + ' -------------------------')
const externals =
  process.env.NODE_ENV === 'production'
    ? {
      'vue': 'Vue',
      'vuex': 'Vuex',
      'vue-router': 'VueRouter',
      'moment': 'moment',
      'element-ui': 'ELEMENT'
    }
    : {}
module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      template: process.env.NODE_ENV === 'production' ? 'public/index.html' : 'public/local.html',
      filename: 'index.html'
    }
  },

  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',

  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8000,
    hot: true,
    open: true,
    overlay: {
      warnings: true,
      errors: true
    },
    proxy: {
      // 测试37 开发34 王恩74 李宾哲132 赵伟116 牛昌昌92 张涛77
      '/api': {
        target: 'http://127.0.0.1:7001'
        // target: 'http://192.168.130.33:7001'
      }
    }
  },

  css: {
    sourceMap: process.env.NODE_ENV !== 'production',
    loaderOptions: {
      css: {
        // 该版本的vue-cli会报错
        // localIdentName: '[local]-[hash:base64:10]',
        // camelCase: 'only'
      },
      scss: {
        prependData: `@import "@/assets/scss/config.scss";`
      }
    }
  },
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  configureWebpack: {
    externals
  }
}
