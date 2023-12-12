import isArray from 'lodash-es/isArray'

export function fromArray<T>(arg: T | T[] | undefined, def?: T): T {
  if ( isArray(arg) ) {
    return (arg as T[])[0] || (def as T)
  } else {
    return (arg as T) || (def as T)
  }
}
