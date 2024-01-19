import { fromArray } from '@/utils/array'

export const ASSISTANT = 'assistant.acorn.io.assistant'
export const MESSAGE = 'assistant.acorn.io.message'
export const THREAD = 'assistant.acorn.io.thread'

export const NAMESPACE = 'namespace'
export const SCHEMA = 'schema'

interface TypeConfig {
  nice: string
  singular: string
  eventKind?: string
  watchable?: boolean
  creatable?: boolean
  preloadable?: boolean
  editable?: boolean
  details?: boolean
  detailRoute?: string | ((resource: DecoratedResource) => string)
  pollTransitioning?: boolean
  defaultSort?: string | string[] // Safe to use only on fields that change only when load()-ing new data (subscribe).
  loadAfterSave?: boolean
}

const config: Record<string, TypeConfig> = {
  [ASSISTANT]: {
    nice:        'assistants',
    singular:    'assistant',
    defaultSort: 'id'
  },
  [MESSAGE]: {
    nice:        'messages',
    singular:    'message',
    defaultSort: 'metadata.creationTimestamp'
  },
  [THREAD]: {
    nice:        'threads',
    singular:    'thread',
    defaultSort: 'id'
  },
}

const reverse: Record<string, string> = {}

for ( const k of Object.keys(config) ) {
  reverse[config[k].nice] = k
  reverse[config[k].singular] = k
}

export function toNice(apiType: string, singular = false): string {
  let out: string

  if ( singular ) {
    out = config[apiType]?.singular
  } else {
    out = config[apiType]?.nice
  }

  if ( out ) {
    return out
  }

  throw new Error(`Unmapped type: ${ apiType }`)
}

export function fromNice(nice: string | string[]): string {
  nice = fromArray(nice)
  const out = reverse[nice]

  if ( out ) {
    return out
  }

  throw new Error(`Unmapped reverse type: ${ nice }`)
}

export function pollTransitioning(type: string) {
  return config[type]?.pollTransitioning === true
}

export function watchable(type: string) {
  return config[type]?.watchable !== false
}

export function creatable(type: string) {
  return config[type]?.creatable !== false
}

export function details(type: string) {
  return config[type]?.details !== false
}

export function editable(type: string) {
  return config[type]?.editable !== false
}

export function preloadable(type: string) {
  return config[type]?.preloadable !== false
}

export function detailRoute(type: string, resource: DecoratedResource) {
  const override = config[type]?.detailRoute

  if ( typeof override === 'function' ) {
    return override(resource)
  } else if ( override ) {
    return override
  } else {
    throw new Error('No detail route')
  }
}

export function defaultSort(type: string) {
  if ( typeof config[type]?.defaultSort === 'undefined' ) {
    return 'nameSort'
  }

  return config[type]?.defaultSort
}

export function loadAfterSave(type: string) {
  return config[type]?.loadAfterSave !== false
}
