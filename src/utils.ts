import * as path from 'path';
import type { ParsedPath } from 'path';

/**
 * 判断当前参数是否为空值
 * @param { any } o
 * @return { boolean }
 */
export function isNil<T>(o: any): o is T {
  return o === undefined || o === null;
}

/**
 * 格式化文件路径
 * @param { string } p: 文件路径
 */
export function formatPath(p: string): string {
  return p.replace(/\\/g, '/');
}

/**
 * 获取文件的扩展名
 * @param { string | undefined } file
 * @return { string }
 */
export function getFileExt(file: string | undefined): string {
  const defaultExt: string = 'file';

  if (isNil<undefined>(file)) {
    return defaultExt;
  }

  const parseResult: ParsedPath = path.parse(file);

  return parseResult.ext ? parseResult.ext.substr(1) : defaultExt;
}