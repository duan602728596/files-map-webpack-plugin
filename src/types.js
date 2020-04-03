export function isNil(t) {
  return t === undefined || t === null;
}

export function isPlainObject(t) {
  return typeof t === 'object' && Object.prototype.toString(t) === '[object Object]';
}