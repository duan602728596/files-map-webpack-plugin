import path from 'path';

/**
 * 判断当前参数是否为空值
 * @param { any } t
 * @return { boolean }
 */
export function isNil(t) {
  return t === undefined || t === null;
}

/**
 * 格式化文件路径
 * @param { string } p: 文件路径
 */
export function formatPath(p) {
  return p.replace(/\\/g, '/');
}

/**
 * 获取文件的扩展名
 * @param { string | undefined } file
 * @return { string }
 */
export function getExt(file) {
  const defaultExt = 'file';

  if (isNil(file)) {
    return defaultExt;
  }

  const outputParseResult = path.parse(file);

  return outputParseResult.ext ? outputParseResult.ext.substr(1) : defaultExt;
}