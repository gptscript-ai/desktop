export const isArray = Array.isArray

export function firstOf<T>(arg: T | T[] | undefined, def?: T): T {
  if (isArray(arg)) {
    return (arg as T[])[0] || (def as T)
  } else {
    return (arg as T) || (def as T)
  }
}

export function clear<T>(ary: T[]) {
  ary.splice(0, ary.length)

  return ary
}

export function replaceWith<T>(ary: T[], ...objs: T[]) {
  ary.splice(0, ary.length, ...objs)

  return ary
}

export function addObject<T>(ary: T[], obj: T) {
  const idx = ary.indexOf(obj)

  if (idx === -1) {
    ary.push(obj)
  }

  return ary
}

export function addObjects<T>(ary: T[], objs: T[]): void {
  const unique: any[] = []

  for (const obj of objs) {
    if (!ary.includes(obj) && !unique.includes(obj)) {
      unique.push(obj)
    }
  }

  ary.push(...unique)
}

export function removeObject<T>(ary: T[], obj: T) {
  const idx = ary.indexOf(obj)

  if (idx >= 0) {
    ary.splice(idx, 1)
  }

  return ary
}

export function insertAt<T>(ary: T[], idx: number, ...objs: T[]): void {
  ary.splice(idx, 0, ...objs)
}

export function removeAt<T>(ary: T[], idx: number, len = 1) {
  if (idx < 0) {
    throw new Error('Index too low')
  }

  if (idx + len > ary.length) {
    throw new Error('Index + length too high')
  }

  ary.splice(idx, len)

  return ary
}

export function fromArray<T>(arg: T | T[] | undefined, def?: T): T {
  if (isArray(arg)) {
    return (arg as T[])[0] || (def as T)
  } else {
    return (arg as T) || (def as T)
  }
}
