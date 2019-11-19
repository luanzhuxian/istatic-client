import Fetch from './fetch'
import { Message } from 'element-ui'
const fetch = new Fetch({
  timeout: 15000,
  headers: {
    'Content-type': 'application/json'
  }
})
fetch.interceptors.request = (url, config) => {
  return config
}
fetch.interceptors.response = async resPromise => {
  try {
    let res = await resPromise
    console.log(res)
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
  }
}

export default fetch
