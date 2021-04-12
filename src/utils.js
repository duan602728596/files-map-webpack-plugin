/**
 * 判断当前参数是否为空值
 * @param { any } t
 * @return { boolean }
 */
export function isNil(t) {
  return t === undefined || t === null;
}

/**
 * 判断当前的参数是否为object
 * @param { any } t
 * @return { boolean }
 */
export function isPlainObject(t) {
  return typeof t === 'object' && Object.prototype.toString(t) === '[object Object]';
}

/**
 * 格式化文件路径
 * @param { string } p: 文件路径
 */
export function formatPath(p) {
  return p.replace(/\\/g, '/');
}