// Portions Copyright (c) 2014-2021 Rancher Labs, Inc. https://github.com/rancher/dashboard

// import { JSONPath } from 'jsonpath-plus';
import cloneDeep from 'lodash-es/cloneDeep.js'
import difference from 'lodash-es/difference.js'
import flattenDeep from 'lodash-es/flattenDeep.js'
import compact from 'lodash-es/compact.js'
import transform from 'lodash-es/transform.js'
import isEqual from 'lodash-es/isEqual.js'
import isObject from 'lodash-es/isObject.js'
import isEmpty from 'lodash-es/isEmpty.js'
import { addObject, isArray } from './array'
import { appendObjectPath, isNumeric, joinObjectPath, splitObjectPath } from './string'

export type JsonValue = null | undefined | string | number | boolean | JsonArray | JsonDict | object
export type JsonArray = JsonValue[]
export interface JsonDict extends Record<string, JsonValue> { }

type Change = {
  path: string
  op: string
  from: JsonValue
  value: JsonValue
}
interface ChangeSet extends Record<string, Change> {}

export function set(obj: JsonDict | null, path: string, value: any): any {
  let ptr: any = obj

  if (!ptr) {
    return
  }

  const parts = splitObjectPath(path)

  for (let i = 0; i < parts.length; i++) {
    const key = parts[i]

    if (i === parts.length - 1) {
      // Vue.set(ptr, key, value)
      ptr[key] = value
    } else if (!ptr[key]) {
      // Make sure parent keys exist
      // Vue.set(ptr, key, {})
      if ( isNumeric(parts[i + 1]) ) {
        ptr[key] = []
      } else {
        ptr[key] = {}
      }
    }

    ptr = ptr[key]
  }

  return obj
}

export function get(obj: JsonDict | object | null, path: string): any {
  /*
  if (path.startsWith('$')) {
    try {
      return JSONPath({
        path,
        json: obj,
        wrap: false,
      })
    } catch (e) {
      console.error('JSON Path error', e, path, obj) // eslint-disable-line no-console

      return '(JSON Path err)'
    }
  }
  */

  if ( !obj ) {
    throw new Error('Missing object')
  }

  if (!path.includes('.')) {
    return obj[path]
  }

  const parts = splitObjectPath(path)
  let ptr = obj as JsonValue

  for (let i = 0; i < parts.length; i++) {
    if (!ptr) {
      return
    }

    ptr = <JsonDict>ptr[parts[i]]
  }

  return ptr
}

export function getter(path: string) {
  return function (obj: JsonDict) {
    return get(obj, path)
  }
}

export function remove(obj: JsonDict, path: string): JsonDict {
  const parentAry = splitObjectPath(path)
  const leafKey = parentAry.pop() as string
  let parent

  if ( parentAry.length ) {
    parent = get(obj, joinObjectPath(parentAry))
  } else {
    parent = obj
  }

  if (parent) {
    // Vue.set(parent, leafKey, undefined)
    parent[leafKey] = undefined
    delete parent[leafKey]
  }

  return obj
}

export function clone<T>(obj: T): T {
  return cloneDeep(obj)
}

export function definedKeys(obj: JsonDict): string[] {
  const keys = Object.keys(obj).map((key) => {
    const val = obj[key]

    if ( Array.isArray(val) ) {
      return key
    } else if ( isObject(val) ) {
      return definedKeys(val).map(subkey => appendObjectPath(key, subkey))
    } else {
      return key
    }
  })

  return compact(flattenDeep(keys))
}

export function diff(from: JsonDict, to: JsonDict): JsonDict {
  // Copy values in 'to' that are different than from
  const out = transform(<any>to, (res: any, toVal: JsonValue, k: string) => {
    const fromVal = (<JsonDict>from)?.[k]

    if (isEqual(toVal, fromVal)) {
      return
    }

    if (isArray(toVal) || isArray(fromVal)) {
      // Don't diff arrays, just use the whole value
      res[k] = toVal
    } else if (isObject(toVal) && isObject(fromVal)) {
      res[k] = diff(fromVal as JsonDict, toVal as JsonDict)
    } else {
      res[k] = toVal
    }
  })

  const fromKeys = definedKeys(from)
  const toKeys = definedKeys(to)
  const missing = difference(fromKeys, toKeys)

  for (const k of missing) {
    set(out, k, null)
  }

  return out
}

export function changeset(from: JsonDict, to: JsonDict, parentPath: string[] = []): ChangeSet {
  let out: ChangeSet = {}

  if (isEqual(from, to)) {
    return out
  }

  for (const k in from) {
    const path = joinObjectPath([...parentPath, k])

    if (!(k in to)) {
      out[path] = <Change>{ op: 'remove', path }
    } else if ((isObject(from[k]) && isObject(to[k])) || (isArray(from[k]) && isArray(to[k]))) {
      out = { ...out, ...changeset(<JsonDict>from[k], <JsonDict>to[k], [...parentPath, k]) }
    } else if (!isEqual(from[k], to[k])) {
      out[path] = <Change>{ op: 'change', from: from[k], value: to[k] }
    }
  }

  for (const k in to) {
    if (!(k in from)) {
      const path = joinObjectPath([...parentPath, k])

      out[path] = <Change>{ op: 'add', value: to[k] }
    }
  }

  return out
}

export function changesetConflicts(a: ChangeSet, b: ChangeSet): string[] {
  let keys = (<string[]>Object.keys(a)).sort()
  const out: string[] = []
  const seen: Record<string, boolean> = {}

  for (const k of keys) {
    let ok = true
    const aa = a[k]
    const bb = b[k]

    // If we've seen a change for a parent of this key before (e.g. looking at `spec.replicas` and there's already been a change to `spec`), assume they conflict
    for (const parentKey of parentKeys(k)) {
      if (seen[parentKey]) {
        ok = false
        break
      }
    }

    seen[k] = true

    if (ok && bb) {
      switch (`${ aa.op }-${ bb.op }`) {
        case 'add-add':
          if ( isEmpty(aa.value) === isEmpty(bb.value) ) {
            ok = isEqual(aa.value, bb.value)
          } else {
            ok = true
          }
          break

        case 'add-change':
          if ( isEmpty(aa.value) ) {
            ok = true
          } else {
            ok = isEqual(aa.value, bb.value)
          }
          break

        case 'change-add':
          if ( isEmpty(bb.value) ) {
            ok = true
          } else {
            ok = isEqual(aa.value, bb.value)
          }
          break

        case 'change-change':
          ok = isEqual(aa.value, bb.value)
          break

        case 'add-remove':
        case 'change-remove':
        case 'remove-add':
        case 'remove-change':
          ok = false
          break

        case 'remove-remove':
        default:
          ok = true
          break
      }
    }

    if (!ok) {
      addObject(out, k)
    }
  }

  // Check parent keys going the other way
  keys = Object.keys(b).sort()
  for (const k of keys) {
    let ok = true

    for (const parentKey of parentKeys(k)) {
      if (seen[parentKey]) {
        ok = false
        break
      }
    }

    seen[k] = true

    if (!ok) {
      addObject(out, k)
    }
  }

  return out.sort()

  function parentKeys(k: string) {
    const out = []
    const parts = splitObjectPath(k)

    parts.pop()

    while (parts.length) {
      const path = joinObjectPath(parts)

      out.push(path)
      parts.pop()
    }

    return out
  }
}

export function applyChangeset(obj: JsonDict, changeset: ChangeSet) {
  let entry

  for (const path in changeset) {
    entry = changeset[path]

    if (entry.op === 'add' || entry.op === 'change') {
      set(obj, path, entry.value)
    } else if (entry.op === 'remove') {
      remove(obj, path)
    } else {
      throw new Error(`Unknown operation:${ entry.op }`)
    }
  }

  return obj
}
