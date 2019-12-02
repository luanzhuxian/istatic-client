import qs from 'qs'
const CreateRequest = Symbol('create-req')
const CreateHeaders = Symbol('create-headers')
const request = Symbol('request')
export default class Fetch {
  /**
   * 可选择的默认配置项，多余选项会被忽略
   * @type {{headers: {}, baseURI: string, model: string, type: string, timeout: number}}
   */
  defaultConfig = {
    headers: {}, // 一个对象，可包含请求头中的相关属性
    model: 'same-origin',
    baseURI: '',
    timeout: 0 // 超时时间
  }
  interceptors = {
    request: null,
    response: null
  }
  timer = 0
  /**
   * 构造函数
   * @param config {object} 默认配置
   * @property config.headers {object} 默认的请求头
   * @property config.timeout {number} 请求超时时间
   */
  constructor (config) {
    Object.assign(this.defaultConfig, config)
  }
  /**
   * 请求，所有方法同下
   * @param config {object} 发起请求的时候传入的配置，参数同 defaultConfig
   */
  async get (url, config = {}) {
    config.method = 'GET'
    return this[request](url, null, config)
  }
  async post (url, body, config = {}) {
    body = body || null
    config.method = 'POST'
    return this[request](url, body, config)
  }
  async put (url, body, config = {}) {
    body = body || {}
    config.method = 'PUT'
    return this[request](url, body, config)
  }
  async delete (url, body, config = {}) {
    body = body || {}
    config.method = 'DELETE'
    return this[request](url, body, config)
  }
  async update (url, body, config = {}) {
    body = body || {}
    config.method = 'UPDATE'
    return this[request](url, body, config)
  }
  // 请求对象
  async [request] (url, body, config = {}) {
    // 配置请求拦截器
    if (this.interceptors.request) {
      config = this.interceptors.request(url, config)
    }
    if (config.params) {
      url += `?${qs.stringify(config.params)}`
      delete config.params
    }
    const req = this[CreateRequest](url, body, config)
    try {
      let res
      if (this.interceptors.response) {
        res = await this.interceptors.response(fetch(req))
      } else {
        res = await fetch(req)
      }
      return res
    } catch (e) {
      throw e
    } finally {
      clearTimeout(this.timer)
    }
  }
  /**
   * 根据现有配置，创建一个request对象
   * @param url {string} 请求地址
   * @param body {object} 数据
   * @param config {object} 配置
   * @property config.method
   * @property config.headers
   * @property config.body
   * @property config.mode
   * @property config.credentials
   * @property config.cache
   * @property config.redirect
   * @property config.referrer
   * @property config.integrity
   * @property config.signal {AbortSignal}
   * @return {Request}
   */
  [CreateRequest] (url, body, config = {}) {
    const defaultConfig = this.copyObject(this.defaultConfig)
    // 用来终止请求的对象
    const controller = new AbortController()
    Object.assign(defaultConfig.headers || {}, config.headers)
    delete config.headers
    Object.assign(defaultConfig, config)
    // 将body改为formData
    if (defaultConfig.type === 'FormData' && body) {
      let b = new FormData()
      for (let [k, v] of Object.entries(body)) {
        b.append(k, v)
      }
      defaultConfig.body = b
      // formData类型不需要传Content-Type
      delete defaultConfig.headers['Content-Type']
    } else if (body) {
      defaultConfig.body = JSON.stringify(body)
    }
    // 生成Headers对象
    defaultConfig.headers = this[CreateHeaders](defaultConfig.headers)
    defaultConfig.signal = controller.signal
    // 替换config中的headers对象为新构建的header对象
    url = (defaultConfig.baseURI || '') + url
    // 如果超时，就终止请求，终止后，错误会在catch中捕获
    if (defaultConfig.timeout > 0) {
      this.timer = setTimeout(() => {
        controller.abort()
      }, defaultConfig.timeout)
    }
    return new Request(url, defaultConfig)
  }
  /**
   * 创建Headers对象
   * @param headers {Object}
   * @return {Headers}
   */
  [CreateHeaders] (headers = {}) {
    const HEADERS = new Headers()
    for (let key of Object.keys(headers)) {
      HEADERS.append(key, headers[key])
    }
    return HEADERS
  }
  copyObject (obj = {}) {
    return JSON.parse(JSON.stringify(obj))
  }
}
