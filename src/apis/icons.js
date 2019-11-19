import fecth from '../assets/js/fetch-config'

/**
 * 获取图标
 * @param params {Object}
 * @property params.projectId {string}
 * @property params.recycle {number} 1 正常图标， 0 回收站图标
 * @return {Promise<*>}
 */
export const getIcons = (params) => fecth.get(`/api/icons`, { params })
export const upload = (data) => fecth.post('/api/icons', data, { type: 'FormData' })
export const remove = (id) => fecth.delete(`/api/icons/${id}`)
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
export const updateIcons = (id, body) => fecth.put(`/api/icons/${id}`, body)
