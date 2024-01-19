import isObject from 'lodash-es/isObject.js'
import type { JsonDict } from '@/utils/object'
import type { IWatch } from '@/composables/steve/server'

export function normalizeType(type: string): string {
  type = (type || '').toLowerCase()

  return type
}

export function keyForSubscribe({
  resourceType, type, namespace, id, selector,
}: IWatch) {
  return `${ resourceType || type || '' }/${ namespace || '' }/${ id || '' }/${ selector || '' }`
}

export function watchesAreEquivalent(a: IWatch, b: IWatch) {
  if ( a.type !== b.type ) {
    return false
  }

  if ( a.id !== b.id && (a.id || b.id) ) {
    return false
  }

  if ( a.namespace !== b.namespace && (a.namespace || b.namespace) ) {
    return false
  }

  if ( a.selector !== b.selector && (a.selector || b.selector) ) {
    return false
  }

  return true
}

const diffRootKeys = [
  'actions', 'links', 'status', '__rehydrate', '__clone',
]

const diffMetadataKeys = [
  'ownerReferences',
  'selfLink',
  'creationTimestamp',
  'deletionTimestamp',
  'state',
  'fields',
  'relationships',
  'generation',
  'managedFields',
  'resourceVersion',
]

const newRootKeys = [
  'actions', 'links', 'status', 'id',
]

const newMetadataKeys = [
  ...diffMetadataKeys,
  'uid',
]

export function cleanForNew(obj: JsonDict) {
  const m = <JsonDict>obj.metadata

  dropKeys(obj, newRootKeys)
  dropKeys(m, newMetadataKeys)

  m.name = ''

  return obj
}

export function cleanForDiff(obj: JsonDict) {
  const m = <JsonDict>(obj.metadata || {})

  if ( !m.labels ) {
    m.labels = {}
  }

  if ( !m.annotations ) {
    m.annotations = {}
  }

  dropUnderscores(obj)
  dropKeys(obj, diffRootKeys)
  dropKeys(m, diffMetadataKeys)

  return obj
}

function dropUnderscores(obj: JsonDict) {
  for ( const k in obj ) {
    if ( k.startsWith('__') ) {
      delete obj[k]
    } else {
      const v = obj[k]

      if ( isObject(v) ) {
        dropUnderscores(<JsonDict>v)
      }
    }
  }
}

function dropKeys(obj: JsonDict, keys: string[]) {
  if ( !obj ) {
    return
  }

  for ( const k of keys ) {
    delete obj[k]
  }
}
