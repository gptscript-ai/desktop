import https from 'node:https'
import type { StateTree, Store } from 'pinia'
import { markRaw, reactive } from 'vue'
import type { ICollection, IMetadata, IResource, ISchema } from '@/composables/steve/types'
import { keyForSubscribe, normalizeType, watchesAreEquivalent } from '@/composables/steve/normalize'
import { SCHEMA } from '@/config/schemas'
import Socket, { EVENT_CONNECTED, EVENT_CONNECT_ERROR, EVENT_DISCONNECTED, EVENT_MESSAGE } from '@/utils/socket'
import type { JsonDict, JsonValue } from '@/utils/object'
import urlOptions from '@/composables/steve/urloptions'
import { addObject, clear, removeObject } from '@/utils/array'
import { SIMPLE_TYPES, typeRef } from '@/models/schema'
import decorate from '@/composables/steve/decorate'
import { useContext } from '@/stores/context'

export interface ISteveServerState extends StateTree {
  name: string
  baseUrl: string
  schemas: Record<string, DecoratedSchema>
  typeStores: Record<string, Store>
  limitNamespace: string
  socket?: Socket
  queue: IQueueAction[]
  queueTimer?: NodeJS.Timeout
  wantSocket: boolean
  debugSocket: boolean
  pendingFrames: JsonDict[]
  started: IWatch[]
  inError: Record<string, string>
}

export interface IWatch {
  type?: string
  resourceType?: string
  namespace?: string
  id?: string
  selector?: string
  revision?: string
  resourceVersion?: string
  stop?: boolean
  force?: boolean
}

export interface IWatchMsg {
  name?: string
  namespace?: string
  id?: string
  selector?: string
  resourceType?: string
  revision?: string
  error?: boolean
  reason?: string
  data?: IResource
}

export interface IQueueAction {
  action: 'load' | 'remove' | 'forgetType'
  type: string
  id: string
  body?: any
  event?: string
}

export interface IUrlOpt {
  url?: string
  filter?: Record<string, string | string[]>
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface IRequestOpt {
  url?: string
  method?: string
  httpsAgent?: https.Agent
  headers?: Record<string, string>
  body?: JsonValue | string
  responseType?: 'json' | 'blob' | 'text' | 'arrayBuffer'
  redirectUnauthorized?: boolean

  force?: boolean
  retry?: number

  filter?: Record<string, (string | string[])>
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'

  depaginate?: boolean
  load?: 'all' | 'multi' | 'allIfAuthed' | 'none' | boolean
  watch?: boolean
  watchNamespace?: string
  forceWatch?: boolean
}

export const NO_WATCH = 'NO_WATCH'
export const NO_SCHEMA = 'NO_SCHEMA'

function defaultMetadata(schema: DecoratedSchema) {
  const ctx = useContext()

  const out: IMetadata = {
    annotations: {},
    labels:      {},
    name:        '',
  }

  if ( schema.attributes?.namespaced ) {
    out.namespace = ctx.namespace
  }

  return out
}

export function SteveServerState(): ISteveServerState {
  return {
    name:           '',
    baseUrl:        '',
    referenceId:    '',
    schemas:        reactive<Record<string, DecoratedSchema>>({}),
    typeStores:     {},
    limitNamespace: '',
    queue:          [],
    wantSocket:     false,
    debugSocket:    false,
    pendingFrames:  [],
    started:        [],
    inError:        {},
  }
}

export const SteveServerGetters = {
  schemaFor: (state: ISteveServerState) => (type: string): DecoratedSchema | undefined => {
    const want = normalizeType(type)

    return state.schemas[want]
  },

  storeFor: (state: ISteveServerState) => (type: string): Store | undefined => {
    return state.typeStores[normalizeType(type)]
  },

  urlFor: (state: ISteveServerState) => (type: string, id?: string, opt: IUrlOpt = {}): string => {
    opt = opt || {}
    type = normalizeType(type)
    let url = opt.url

    if ( !url ) {
      if ( type === SCHEMA ) {
        url = SCHEMA
      } else {
        const schema = state.schemas[type]

        if ( !schema ) {
          throw new Error(`Unknown schema for type: ${ type }`)
        }

        url = schema.links?.collection

        if ( !url ) {
          throw new Error(`You don't have permission to list this type: ${ type }`)
        }
        if ( id ) {
          url += `/${ id }`
        }
      }
    }

    url = urlOptions(url, opt)

    return url
  },

  canWatch: (state: ISteveServerState) => (obj: IWatch): boolean => {
    return !state.inError[keyForSubscribe(obj)]
  },

  watchStarted: (state: ISteveServerState) => (obj: IWatch): boolean => {
    return !!state.started.find(entry => watchesAreEquivalent(obj, entry))
  },

  existingWatchFor: (state: ISteveServerState) => (obj: IWatch): IWatch | undefined => {
    return state.started.find(entry => watchesAreEquivalent(obj, entry))
  },
}

export const SteveServerActions = {
  configure(this: StateTree, baseUrl: string, referenceId = ''): void {
    this.name = this.$id
    this.baseUrl = baseUrl
    this.referenceId = referenceId
  },

  registerStore(this: StateTree, type: string, store: Store) {
    type = normalizeType(type)

    let raw = this.typeStores[type]

    if ( !raw ) {
      raw = markRaw(store)
      this.typeStores[type] = raw
    }

    return raw
  },

  defaultFor(this: StateTree, type: string, depth = 0): JsonDict {
    const schema = this.schemaFor(type)

    if ( !schema ) {
      return {}
    }

    const out: JsonDict = {}

    if ( depth === 0 ) {
      out.type = type
    }

    for ( const key in schema.resourceFields ) {
      const field = schema.resourceFields[key]

      if ( !field ) {
        // Not much to do here...
        continue
      }

      if ( depth === 0 && key === 'metadata' ) {
        out[key] = defaultMetadata(schema) as JsonDict
        continue
      }

      if ( depth === 0 && key === 'status' ) {
        continue
      }

      const type = field.type
      const mapOf = typeRef('map', type)
      const arrayOf = typeRef('array', type)
      const referenceTo = typeRef('reference', type)

      if ( mapOf || type === 'map' || type === 'json' ) {
        out[key] = this.defaultFor(type, depth + 1) || {}
      } else if ( arrayOf || type === 'array' ) {
        out[key] = []
      } else if ( referenceTo ) {
        out[key] = undefined
      } else if ( SIMPLE_TYPES.includes(type) ) {
        if ( typeof field.default === 'undefined' ) {
          out[key] = undefined
        } else {
          out[key] = field.default
        }
      } else {
        out[key] = this.defaultFor(type, depth + 1)
      }
    }

    return out
  },

  async request(this: StateTree, opt: IRequestOpt): Promise<JsonValue> {
    if ( !opt.url ) {
      throw new Error('Must specify a URL to request')
    }

    if ( !opt.url.startsWith('/') && !opt.url.startsWith('http') ) {
      let baseUrl = this.baseUrl.replace(/\/$/, '')
      let url = opt.url

      while ( url.startsWith('../') ) {
        baseUrl = baseOf(baseUrl, '/')
        url = url.substring(3)
      }

      opt.url = `${ baseUrl }/${ url }`
    }

    if ( opt.url.startsWith('http://localhost') ) {
      opt.url = opt.url.replace(/^http/, 'https')
    }

    opt.depaginate = opt.depaginate !== false
    opt.url = opt.url.replace(/\/*$/g, '')

    if ( process.server ) {
      opt.httpsAgent = new https.Agent({ rejectUnauthorized: false })
    }

    const method = (opt.method || 'get').toLowerCase()
    const headers = (opt.headers || {})
    // const key = JSON.stringify(headers) + method + opt.url

    if ( !headers.accept ) {
      headers.accept = 'application/json'
    }

    if ( process.client ) {
      const csrf = useCookie('CSRF')

      headers['x-api-csrf'] = csrf.value
    }

    let status: number
    let responseHeaders: Headers

    const res = await $fetch(opt.url, {
      method:       method as any,
      retry:        false,
      headers,
      baseURL:      '/',
      credentials:  'include',
      body:         <Record<string, any> | string>opt.body,
      responseType: opt.responseType || 'json',
      async onResponse({ response }) {
        status = response.status
        responseHeaders = response.headers
      },
      async onResponseError({ response }) {
        status = response.status
        responseHeaders = response.headers

        if ( status === 401 && opt.redirectUnauthorized !== false ) {
          // notLoggedIn(useRouter().currentRoute.value)
          throw new Error('401')
        }
      },
    }) as JsonDict

    // const error = res.error
    // const data = res.data as JsonDict

    // if (error) {
    //   return onError(error, data)
    // }

    const ret = responseObject(res)

    return ret

    // function onError(err: any, data: JsonDict): Promise<IError> {
    //   if ( !data ) {
    //     data = err.data || {}
    //   }

    //   let out: any

    //   if ( data ) {
    //     // Go to the logout page for 401s, unless redirectUnauthorized specifically disables (for the login page)
    //     // if ( opt.redirectUnauthorized !== false && process.client && res.status === 401 ) {
    //     //   dispatch('auth/logout', opt.logoutOnError, { root: true });
    //     // }

    //     out = data
    //   } else {
    //     out = { code: 'Unknown', status: 0, message: (err as Error).toString() }
    //   }

    //   console.error('Request error', out)

    //   return Promise.reject(responseObject(out))
    // }

    function responseObject(res: JsonDict) {
      let out = res

      // const fromHeader = responseHeaders['x-api-cattle-auth'];
      // if ( fromHeader && fromHeader !== rootGetters['auth/fromHeader'] ) {
      //   dispatch('auth/gotHeader', fromHeader, { root: true });
      // }

      if ( status === 204 || out === null ) {
        out = {}
      }

      if ( typeof out !== 'object' ) {
        out = { data: out }
      }

      Object.defineProperties(out, {
        _status:     { value: status },
        _headers:    { value: responseHeaders },
        _url:        { value: opt.url },
      })

      return out
    }
  },

  async loadSchemas(this: StateTree, watch = true, copy?: ISchema[]): Promise<ISchema[]> {
    if ( copy ) {
      console.info('Copying Schemas…')

      for ( const k of copy ) {
        this.schemas[k.id] = k
      }

      if ( watch !== false ) {
        this.watch({ type: SCHEMA })
      }
    } else {
      console.info('Loading Schemas…')

      const schemas = await this.request({ url: this.urlFor(SCHEMA) }) as ICollection<ISchema>

      for ( const data of schemas.data ) {
        try {
          const schema = await decorate<ISchema, DecoratedSchema>(data, this)

          this.schemas[normalizeType(data.id)] = schema
        } catch (e) {
        }
      }

      if ( watch !== false ) {
        this.watch({
          type:     SCHEMA,
          revision: schemas.revision,
        })
      }

      console.info(`Loaded ${ schemas.data.length } Schemas`)
    }

    return this.schemas
  },

  cloneSchemas(this: StateTree): ISchema[] {
    return Object.values(this.schemas)
  },

  reset(this: StateTree, disconnect = true): void {
    console.info('Reset', this.name)

    for ( const k in this.typeStores ) {
      this.forgetType(k, disconnect)
    }

    if ( disconnect ) {
      this.schemas = {}
      this.unsubscribe(true)
    }
  },

  subscribe(this: StateTree): void {
    if ( process.server ) {
      return
    }

    let socket = this.socket

    this.wantSocket = true

    this.debugSocket && console.debug(`Subscribe [${ this.name }]`)

    const url = `${ this.baseUrl }/subscribe`

    if ( socket ) {
      socket.setAutoReconnect(true)
      socket.setUrl(url)
    } else {
      socket = new Socket(url)
      this.socket = socket

      socket.on(EVENT_CONNECTED, (e: Message) => {
        this.opened(e)
      })

      socket.on(EVENT_DISCONNECTED, (e: Message) => {
        this.closed(e)
      })

      socket.on(EVENT_CONNECT_ERROR, (e: Message) => {
        this.error(e.detail)
      })

      socket.on(EVENT_MESSAGE, (e: Message) => {
        const event = e.detail

        if ( event.data) {
          const msg = <IWatchMsg>JSON.parse(event.data)

          if (msg?.name && this[`ws.${ msg.name }`] ) {
            this[`ws.${ msg.name }`](msg)
          } else if ( !`${ msg?.name }`.includes('.') ) {
            // @TODO remove Cluster API is sending bad names...
            msg.name = 'resource.change'
          } else {
            console.error('Unknown message type', msg?.name)
          }
        }
      })
    }

    socket.connect({ name: this.name })
  },

  async unsubscribe(this: StateTree, disconnect = true) {
    const socket = this.socket

    clear(this.pendingFrames)

    if ( socket && disconnect) {
      this.wantSocket = false
      clear(this.started)
      await socket.disconnect()
    } else {
      const promises = []

      for ( const entry of this.started.slice() ) {
        if ( entry.type === SCHEMA ) {
          continue
        }

        console.info(`Unsubscribe [${ this.name }]`, JSON.stringify(entry))

        if ( this.schemaFor(entry.type) ) {
          this.setWatchStopped(entry)
          delete entry.revision
          promises.push(this.watch({ ...entry, stop: true }))
          delete this.started[entry]
        }
      }

      await Promise.all(promises)
    }
  },

  async queueChange(this: StateTree, msg: IWatchMsg, load = true, event = '') {
    const { data, revision } = msg

    if ( !data ) {
      return
    }

    const type = normalizeType(data.type)

    if ( type === 'schema' ) {
      const normalizedId = normalizeType(data.id)

      if ( load ) {
        const existing = this.schemas[type]

        if ( existing ) {
          existing.update(data)
        } else {
          const neu = await decorate<ISchema, DecoratedSchema>(data as ISchema, this)

          this.schemas[normalizedId] = neu
        }
      } else {
        delete this.schemas[normalizedId]
        this.forgetType(normalizedId)
      }

      return
    }

    const ts = this.storeFor(type)

    if ( !ts ) {
      return
    }

    ts.revision = Math.max(ts.revision, Number.parseInt(revision || '', 10))

    // console.info(`${ label } Event [${ state.config.namespace }]`, data.type, data.id);

    if ( load ) {
      this.queue.push(<IQueueAction>{
        action:  'load',
        type,
        body:   data,
        event,
      })
    } else {
      this.queue.push(<IQueueAction>{
        action: 'remove',
        type:   data.type,
        id:     data.id,
      })
    }
  },

  async flush(this: StateTree) {
    const queue: IQueueAction[] = this.queue

    if ( !queue.length ) {
      return
    }

    const started = new Date().getTime()

    this.queue = []

    this.debugSocket && console.debug(`Subscribe Flush [${ this.name }]`, queue.length, 'items')

    for ( const {
      action, type, body, id, event,
    } of queue ) {
      const ts = this.storeFor(type)

      if ( action === 'load' ) {
        const obj = await ts.load(body)

        if ( event && obj?.notify ) {
          obj.notify(event)
        }
      } else if ( action === 'remove' ) {
        await ts.remove(id)
      } else if ( action === 'forgetType' ) {
        this.forgetType(type)
      }
    }

    this.debugSocket && console.debug(`Subscribe Flush [${ this.name }] finished`, (new Date().getTime()) - started, 'ms')
  },

  forgetType(this: StateTree, type: string, disconnect = true) {
    type = normalizeType(type)
    const ts = this.storeFor(type)

    if ( ts ) {
      ts.reset()
    }

    if ( disconnect ) {
      delete this.schemas[type]
      delete this.typeStores[type]
    }
  },

  nextResourceVersion(this: StateTree, type: string, id?: string): number | null {
    const ts = this.storeFor(type)

    if ( !ts ) {
      return null
    }

    return ts.nextResourceVersion(id)
  },

  watch(this: StateTree, params: IWatch): void {
    this.debugSocket && console.debug(`Watch Request [${ this.name }]`, JSON.stringify(params))

    let {

      type, selector, id, revision, namespace, stop, force,
    } = params

    if ( this.limitNamespace ) {
      namespace = this.limitNamespace
    }

    type = normalizeType(type || '')

    if ( !stop && !force && !this.canWatch(params) ) {
      this.debugSocket && console.debug(`Cannot Watch [${ this.name }]`, JSON.stringify(params))

      return
    }

    if ( !stop && this.watchStarted({
      type, id, selector, namespace,
    }) ) {
      this.debugSocket && console.debug(`Already Watching [${ this.name }]`, JSON.stringify(params))

      return
    }

    if ( typeof revision === 'undefined' ) {
      revision = this.nextResourceVersion(type, id)
    }

    const msg: IWatch = { resourceType: type }

    if ( revision ) {
      msg.resourceVersion = `${ revision }`
    }

    if ( namespace ) {
      msg.namespace = namespace
    }

    if ( stop ) {
      msg.stop = true
    }

    if ( id ) {
      msg.id = id
    }

    if ( selector ) {
      msg.selector = selector
    }

    this.send(msg)
  },

  enqueuePendingFrame(this: StateTree, obj: any): void {
    this.pendingFrames.push(obj)
  },

  setWatchStarted(this: StateTree, obj: IWatch): void {
    const existing = this.existingWatchFor(obj)

    if ( !existing ) {
      addObject(this.started, obj)
    }

    delete this.inError[keyForSubscribe(obj)]
  },

  setWatchStopped(this: StateTree, obj: IWatch): void {
    const existing = this.existingWatchFor(obj)

    if ( existing ) {
      removeObject(this.started, existing)
    } else {
      console.warn("Tried to remove a watch that doesn't exist", obj)
    }
  },

  setInError(this: StateTree, msg: IWatchMsg): void {
    const key = keyForSubscribe(msg)

    this.inError[key] = msg.reason
  },

  clearInError(this: StateTree, msg: IWatchMsg): void {
    const key = keyForSubscribe(msg)

    delete this.inError[key]
  },

  debug(this: StateTree, on: boolean): void {
    this.debugSocket = on !== false
  },

  reconnectWatches(this: StateTree): Promise<any> {
    const promises = []

    for ( const entry of this.started.slice() ) {
      console.info(`Reconnect [${ this.name }]`, JSON.stringify(entry))

      if ( this.schemaFor(entry.type) ) {
        this.setWatchStopped(entry)
        delete entry.revision
        promises.push(this.watch(entry))
      }
    }

    return Promise.all(promises)
  },

  async resyncWatch(this: StateTree, params: IWatch): Promise<void> {
    const {
      resourceType, namespace, id, selector,
    } = params

    console.info(`Resync [${ this.name }]`, params)

    const ts = this.storeFor(resourceType)

    if ( !ts ) {
      return
    }

    const opt = { force: true, forceWatch: true }

    if ( id ) {
      await ts.find(id, opt)
      this.clearInError(params)

      return
    }

    let have: IResource[]
    let want: IResource[]

    if ( selector ) {
      have = ts.matching(resourceType, selector).slice()
      want = await ts.findMatching({
        selector,
        opt,
      })
    } else {
      if ( namespace ) {
        have = ts.inNamespace(namespace)
      } else {
        have = ts.list.slice()
      }

      want = await ts.findAll({
        watchNamespace: namespace,
        ...opt,
      })
    }

    const wantMap: Record<string, boolean> = {}

    for ( const obj of want ) {
      wantMap[obj.id] = true
    }

    for ( const obj of have ) {
      if ( !wantMap[obj.id] ) {
        this.debugSocket && console.debug(`Remove stale [${ this.name }]`, resourceType, obj.id)

        ts.remove(obj)
      }
    }
  },

  async opened(this: StateTree) {
    this.debugSocket && console.debug(`WebSocket Opened [${ this.name }]`)

    if ( !this.queue ) {
      this.queue = []
    }

    if ( !this.queueTimer ) {
      this.flushQueue = async () => {
        if ( this.queue.length ) {
          await this.flush()
        }

        this.queueTimer = setTimeout(this.flushQueue, 1000)
      }

      this.flushQueue()
    }

    if ( this.socket.hasReconnected ) {
      await this.reconnectWatches()
    }

    // Try resending any frames that were attempted to be sent while the socket was down, once.
    if ( !process.server ) {
      const frames = this.pendingFrames.slice()

      clear(this.pendingFrames)
      for ( const obj of frames ) {
        this.sendImmediate(obj)
      }
    }
  },

  closed(this: StateTree): void {
    this.debugSocket && console.debug(`WebSocket Closed [${ this.name }]`)
    clearTimeout(this.queueTimer)
    this.queueTimer = undefined
  },

  error(this: StateTree, event: IWatchMsg): void {
    console.error(`WebSocket Error [${ this.name }]`, event)
    clearTimeout(this.queueTimer)
    this.queueTimer = undefined
  },

  send(this: StateTree, obj: any): void {
    if ( this.socket ) {
      const ok = this.socket.send(obj)

      if ( ok ) {
        return
      }
    }

    this.enqueuePendingFrame(obj)
  },

  sendImmediate(this: StateTree, obj: any) {
    if ( this.socket ) {
      return this.socket.send(obj)
    }
  },

  'ws.ping': function (this: StateTree) {
    if ( this.name === 'mgmt' ) {
      console.info(`Ping [${ this.name }]`)
    }
  },

  'ws.resource.start': function (this: StateTree, msg: IWatchMsg) {
    this.debugSocket && console.debug(`Resource start: [${ this.name }]`, JSON.stringify(msg))
    this.setWatchStarted({
      type:      msg.resourceType,
      namespace: msg.namespace,
      id:        msg.id,
      selector:  msg.selector,
    })
  },

  'ws.resource.error': function (this: StateTree, msg: IWatchMsg) {
    console.warn(`Resource error [${ this.name }]`, msg.resourceType, ':', msg.data?.error)

    const err = msg.data?.error?.toLowerCase()

    if ( err.includes('watch not allowed') ) {
      this.setInError({ type: msg.resourceType, reason: NO_WATCH })
    } else if ( err.includes('failed to find schema') ) {
      this.setInError({ type: msg.resourceType, reason: NO_SCHEMA })
    } else if ( err.includes('too old') || err.includes('status code 410') ) {
      this.resyncWatch(msg)
    }
  },

  'ws.resource.stop': function (this: StateTree, msg: IWatchMsg) {
    const type = msg.resourceType
    const obj = {
      type,
      id:        msg.id,
      namespace: msg.namespace,
      selector:  msg.selector,
    }

    console.warn(`Resource stop: [${ this.name }]`, msg.resourceType)

    if ( this.schemaFor(type) && this.watchStarted(obj) ) {
      // Try reconnecting once
      this.setWatchStopped(obj)

      setTimeout(() => {
        // Delay a bit so that immediate start/error/stop causes
        // only a slow infinite loop instead of a tight one.
        this.watch(obj)
      }, 5000)
    }
  },

  'ws.resource.create': function (this: StateTree, msg: IWatchMsg) {
    this.queueChange(msg, true, 'create')
  },

  'ws.resource.change': function (this: StateTree, msg: IWatchMsg) {
    this.queueChange(msg, true, 'change')
  },

  'ws.resource.remove': function (this: StateTree, msg: IWatchMsg) {
    this.queueChange(msg, false, 'remove')
  },
}
