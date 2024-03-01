export function clear<T>(ary: T[]) {
  ary.splice(0, ary.length)
}

export function replaceWith<T>(ary: T[], ...objs: T[]) {
  ary.splice(0, ary.length, ...objs)
}

export function removeObject<T>(ary: T[], obj: T): T[] {
  const idx = ary.indexOf(obj)

  if (idx >= 0) {
    ary.splice(idx, 1)
  }

  return ary
}
