import fecth from '../assets/js/fetch-config'

/**
 * 获取在线链接
 * @param projectId {string} 项目id
 * @return {Promise<*>}
 */
export const getLink = (projectId) => fecth.get(`/api/link?projectId=${projectId}`)
/**
 * 生成在线链接
 * @param projectId {string} 项目id
 * @return {Promise<*>}
 */
export const createLink = (projectId) => fecth.post(`/api/link?projectId=${projectId}`)
