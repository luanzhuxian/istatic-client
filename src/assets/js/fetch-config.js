import Fetch from './fetch'
import { Message, Loading } from 'element-ui'
let loadingInstance = null
const fetch = new Fetch({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})
fetch.interceptors.request = (url, config) => {
  loadingInstance = Loading.service({ text: '拼命加载中...', background: 'transparent' })
  return config
}
fetch.interceptors.response = async resPromise => {
  try {
    let res = await resPromise
    if (res.status === 500) {
      throw new Error('服务器正在开小差~')
    }
    if (res.status === 404) {
      throw new Error('请求未找到~')
    }
    return res.json()
  } catch (e) {
    Message.error(e.message)
    throw e
  } finally {
    loadingInstance.close()
  }
}

export default fetch
