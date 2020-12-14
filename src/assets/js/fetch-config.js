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
    const res = await resPromise
    if (res instanceof Blob) {
      return res
    }
    if (res.status !== 200) {
      throw new Error(res.devMessage || res.message)
    }
    return res
  } catch (e) {
    Message.error(e.message)
    throw e
  } finally {
    loadingInstance.close()
  }
}

export default fetch
