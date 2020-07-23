import fetch from '../assets/js/fetch-config'
export const getProjects = () => fetch.get('/api/project')
/**
 * 创建项目
 * @param data {object}
 * @return {Promise<*>}
 */
export const createProject = (data) => fetch.post('/api/project', data)
/**
 * 删除项目
 * @param id {string}
 * @return {Promise<*>}
 */
export const removeProject = (id) => fetch.delete(`/api/project/${id}`)
/**
 * 修改项目
 * @param id {string}
 * @param data {object}
 * @return {Promise<*>}
 */
export const updateProject = (id, data) => fetch.put(`/api/project/${id}`, data)
