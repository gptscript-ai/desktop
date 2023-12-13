export function clear<T>(ary: T[]) {
  ary.splice(0, ary.length)
}

export function replaceWith<T>(ary: T[], ...objs: T[]) {
  ary.splice(0, ary.length, ...objs)
}
