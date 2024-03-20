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

export function removeAt<T>(ary: T[], idx: number, len = 1): T[] {
  if (idx < 0) {
    throw new Error('Index too low')
  }

  if (idx + len > ary.length) {
    throw new Error('Index + length too high')
  }

  ary.splice(idx, len)

  return ary
}
