import fetch from '../assets/js/fetch-config'

/**
 * 获取文件列表
 * @return {Promise<*>}
 */
export const getFiles = (prefix) => fetch.get(`/api/file?prefix=${prefix}`)

/**
 * 上传文件
 * @param data {object}
 * @return {Promise<*>}
 */
export const uploadFiles = (dir, data) => fetch.post(`/api/file?dir=${dir}`, data, { type: 'FormData' })

/**
 * 创建目录
 * @param dirname {string} 新目录名
 * @param path {string}
 * @return {Promise<*>}
 */
export const createDir = (dirname, path) => fetch.post(`/api/create/dir/${dirname}?path=${path}`)

export const removeFile = (path) => fetch.delete(`/api/file/${path}`)

export const removeDir = (path) => fetch.delete(`/api/destroy/dir/${path}`)
