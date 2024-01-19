import type { StateTree } from 'pinia'
import { markRaw, reactive, readonly } from 'vue'
import type { ICollection, IResource } from '@/composables/steve/types'
import type { IRequestOpt, IWatch } from '@/composables/steve/server'
import { clear, isArray, removeObject } from '@/utils/array'
import type { SteveStoreType } from '@/stores/steve'
import decorate from '@/composables/steve/decorate'
import { defaultSort, pollTransitioning, watchable } from '@/config/schemas'

export interface ISteveTypeState<D> extends StateTree {
  name: string
  type: string
  server?: SteveStoreType
  haveSelector: Record<string, boolean>
  haveNamespace: Record<string, boolean>
  haveAll: boolean
  list: IStored<D>[]
  map: Record<string, IStored<D>>
  revision: number
  generation: number
}

export function SteveTypeState<D>(type: string) {
  return (): ISteveTypeState<D> => {
    return {
      name:           '',
      type,
      server:         undefined,
      haveAll:        false,
      haveSelector:   {},
      haveNamespace:  {},
      list:           reactive([]),
      map:            {},
      revision:       0,
      generation:     0,
      sortFields:     defaultSort(type),
    }
  }
}

export function SteveTypeGetters<D>(): StateTree {
  return {
    schema: (state: ISteveTypeState<D>) => {
      return state.server?.schemaFor(state.type)
    },

    all: (state: ISteveTypeState<D>) => {
      if ( !state.haveAll ) {
        console.error(`Asking for all ${ state.type } before they have been loaded`)
      }

      return state.list
    },

    inNamespace: (state: ISteveTypeState<D>) => (namespace: string) => {
      return computed(() => {
        return state.list.filter((obj) => {
          return obj.metadata.namespace === namespace
        })
      })
    },

    byId: (state: ISteveTypeState<D>) => (id: string) => {
      return state.map[id]
    },

    nextResourceVersion: (state: ISteveTypeState<D>) => (id: string): number | null => {
      let revision = 0

      if ( id ) {
        const existing = state.map[id]

        if ( existing ) {
          revision = Number.parseInt(existing.metadata?.resourceVersion || '', 10)
        }
      }

      if ( !revision ) {
        revision = state.revision

        for ( const obj of state.list ) {
          if ( obj && obj.metadata ) {
            const neu = Number.parseInt(obj.metadata.resourceVersion || '', 10)

            revision = Math.max(revision, neu)
          }
        }
      }

      if ( revision > 0 ) {
        return revision
      }

      return null
    },

    haveSelectorFor: (state: ISteveTypeState<D>) => (selector: string): boolean => {
      return state.haveSelector[selector] || false
    },
  }
}

export function SteveTypeActions<T extends IResource, D extends DecoratedResource>() {
  return {
    configure(this: StateTree, server: any) {
      this.name = this.$id
      this.server = markRaw(server)
      this.server.registerStore(this.type, this)
    },

    reset(this: StateTree) {
      clear(this.list)
      this.map = {}
      this.haveAll = false
      this.haveSelector = {}
      this.haveNamespace = {}
      this.revision = 0
      this.generation++
    },

    async loadAll(this: StateTree, data: T[]) {
      clear(this.list)
      this.map = {}
      this.generation++
      await this.loadMulti(data)
      this.haveAll = true
    },

    async loadMulti(this: StateTree, data: T[]) {
      // console.debug('### Mutation loadMulti', data?.length);
      const promises = []

      for ( const entry of data ) {
        promises.push(this.load(entry))
      }

      await Promise.all(promises)
    },

    async loadNamespace(this: StateTree, data: D[], namespace: string) {
      await this.loadMulti(data)
      this.haveNamespace[namespace] = true
    },

    async loadSelector(this: StateTree, data: D[], selector: string) {
      await this.loadMulti(data)
      this.haveSelector[selector] = true
    },

    async load(this: StateTree, data: T & IResource): Promise<D> {
      const id = data.id

      this.generation++

      let entry: D = this.map[id]

      if ( entry ) {
        // There's already an entry in the store, update it
        entry.update(data)

        // console.debug('### Mutation Updated', type, id);
      } else {
        // There's no entry, make a new proxy
        entry = readonly(await decorate<T, D>(data, this)) as D
        this.list.push(entry)
        this.map[id] = entry
        // console.debug('### Mutation', type, id);
      }

      if ( this.sortFields ) {
        this.sortTimer && clearTimeout(this.sortTimer)
        this.sortTimer = setTimeout(() => {
          // console.time(`Sort ${ this.type }`)
          this.list = sortBy(this.list, this.sortFields)
          // console.timeEnd(`Sort ${ this.type }`)
        }, 10)
      }

      if ( pollTransitioning(this.type) && (entry.metadata?.state?.transitioning || entry.metadata?.state?.error) ) {
        entry.pollTransitioning()
      }

      return entry
    },

    async create(this: StateTree, data?: Partial<T>): Promise<IWritable<D>> {
      if ( !this.server ) {
        throw new Error(`No endpoint configured for ${ this.type }`)
      }

      const obj = this.server.defaultFor(this.type)

      Object.assign(obj, data)

      if ( this.server.limitNamespace ) {
        if ( !obj.metadata ) {
          obj.metadata = {}
        }

        obj.metadata.namespace = this.server.limitNamespace
      }

      const out = await decorate<T, D>(obj, this)

      return out
    },

    remove(this: StateTree, objOrId: IStored<IResource> | string) {
      let obj: IStored<IResource>

      if ( typeof objOrId === 'string' ) {
        obj = this.byId(objOrId)
      } else {
        obj = objOrId
      }

      if ( obj ) {
        this.generation++
        removeObject(this.list, obj)
        delete this.map[obj.id]

        return true
      }

      return false
    },

    async findAll(this: StateTree, opt: IRequestOpt = {}): Promise<D[]> {
      if ( this.server.limitNamespace ) {
        const out = await this.findNamespace(this.server.limitNamespace, opt)

        this.haveAll = true

        return out
      }

      if ( opt.force !== true && this.haveAll ) {
        return this.all
      }

      let load = (opt.load === undefined ? 'all' : opt.load)

      if ( opt.load === false || opt.load === 'none' ) {
        load = 'none'
      }

      console.info(`Find All: [${ this.name }] ${ this.type }`)

      opt = opt || {}
      opt.url = this.server.urlFor(this.type, undefined, opt)

      let res: ICollection<T>

      try {
        res = await this.server.request(opt) as unknown as ICollection<T>
      } catch (e) {
        return Promise.reject(e)
      }

      if ( load === 'none' ) {
        return eachLimit(res.data, 20, (obj: T): Promise<D> => decorate<T, D>(obj, this))
      } else if ( typeof res === 'object' && !isArray(res) ) {
        if ( load === 'multi' ) {
          // This has the effect of adding the response to the store,
          // without replacing all the existing content for that type,
          // and without marking that type as having 'all 'loaded.
          //
          // This is used e.g. to load a partial list of settings before login
          // while still knowing we need to load the full list later.
          await this.loadMulti(res.data)
        } else {
          await this.loadAll(res.data)
        }

        if ( opt.watch !== false && watchable(this.type) ) {
          this.server.watch({
            type:      this.type,
            revision:  res.revision,
            namespace: opt.watchNamespace,
          })
        }

        return this.all
      }

      throw new Error("FindAll didn't find anything")
    },

    async findMatching(this: StateTree, selector: string, opt: IRequestOpt = {}): Promise<D[]> {
      opt = opt || {}

      if ( opt.force !== true && this.haveSelectorFor(selector) ) {
        return this.matching(selector)
      }

      console.info(`Find Matching: [${ this.name }] ${ this.type }`, selector)

      opt.filter = opt.filter || {}
      opt.filter.labelSelector = selector

      opt.url = this.server.urlFor(this.type, undefined, opt)

      const res = await this.server.request(opt) as unknown as ICollection<T>

      if ( opt.load === false ) {
        // @TODO support again
        // return res.data.map(d => this.classify(d))
      }

      await this.loadSelector(res.data, selector)

      if ( opt.watch !== false && watchable(this.type) ) {
        this.server.watch({ selector, revision: res.revision })
      }

      return this.matching(selector)
    },

    async findNamespace(this: StateTree, namespace: string, opt: IRequestOpt = {}): Promise<ComputedRef<D[]>> {
      opt = opt || {}

      if ( opt.force !== true && (this.haveAll || this.haveNamespace[namespace] ) ) {
        return this.inNamespace(namespace)
      }

      console.info(`Find Namespace: [${ this.name }] ${ this.type } ${ namespace }`)

      opt = opt || {}
      opt.url = this.server.urlFor(this.type, namespace, opt)

      const res = await this.server.request(opt) as unknown as ICollection<T>

      await this.loadNamespace(res.data, namespace)

      if ( opt.watch !== false && watchable(this.type) ) {
        const watchMsg: IWatch = {
          type:     this.type,
          namespace,
          revision: res.revision,
          force:    opt.forceWatch === true,
        }

        this.server.watch(watchMsg)
      }

      return this.inNamespace(namespace)
    },

    // opt:
    //  filter: Filter by fields, e.g. {field: value, anotherField: anotherValue} (default: none)
    //  limit: Number of records to return per page (default: 1000)
    //  sortBy: Sort by field
    //  sortOrder: asc or desc
    //  url: Use this specific URL instead of looking up the URL for the type/id.  This should only be used for bootstrapping schemas on startup.
    //  @TODO depaginate: If the response is paginated, retrieve all the pages. (default: true)
    async find(this: StateTree, id: string, opt: IRequestOpt = {}): Promise<D> {
      opt = opt || {}

      if ( opt.force !== true ) {
        const out = this.byId(id)

        if ( out ) {
          return out
        }
      }

      console.info(`Find: [${ this.name }] ${ this.type } ${ id }`)

      opt = opt || {}
      opt.url = this.server.urlFor(this.type, id, opt)

      const res = await this.server.request(opt) as unknown as IResource

      await this.load(res)

      if ( opt.watch !== false && watchable(this.type) ) {
        const watchMsg: IWatch = {
          type:     this.type,
          id,
          revision: res?.metadata?.resourceVersion,
          force:    opt.forceWatch === true,
        }

        const idx = id.indexOf('/')

        if ( idx > 0 ) {
          watchMsg.namespace = id.substring(0, idx)
          watchMsg.id = id.substring(idx + 1)
        }

        this.server.watch(watchMsg)
      }

      return this.byId(res.id || id)
    },
  }
}
