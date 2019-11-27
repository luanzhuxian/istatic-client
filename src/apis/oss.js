import fecth from '../assets/js/fetch-config'

/**
 * 获取文件列表
 * @return {Promise<*>}
 */
export const getFiles = (prefixe) => fecth.get(`/api/file?prefixe=${prefixe}`)
