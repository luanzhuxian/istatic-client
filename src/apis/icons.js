import fetch from '../assets/js/fetch-config'

/**
 * 获取图标
 * @param params {Object}
 * @property params.projectId {string}
 * @property params.recycle {number} 1 正常图标， 0 回收站图标
 * @return {Promise<*>}
 */
export const getIcons = (params) => fetch.get(`/api/icons`, { params })

/**
 * 上传图标
 * @param data {object}
 * @property data.projectId {string}
 * @property data.ic {string} 修改图标时的图标id
 * @property data.file1 文件（下同），必须后置
 * @property data.file2
 * ...
 * @return {Promise<*>}
 */
export const upload = (data) => fetch.post('/api/icons', data, { type: 'FormData' })

export const remove = (id) => fetch.delete(`/api/icons/${id}`)

/**
 * 更新图标
 * @param id {string}
 * @param body {icons}
 * @property body.name {string}
 * @property body.desc {string}
 * @property body.content {string}
 * @property body.namespace {string}
 * @property body.visible {number}
 * @return {Promise<*>}
 */
export const updateIcons = (id, body) => fetch.put(`/api/icons/${id}`, body)
