import { reactive } from 'vue'
import type { DeepReadonly } from 'vue'
import type { IResource } from '@/composables/steve/types'
import ResourceImpl from '@/models/resource'
import { uniq } from '@/utils/array'

declare global {
  type IWritable<D> = IResource & DecoratedResource & D
  type IStored<D> = DeepReadonly<IWritable<D>>
}

const resourceKeys = Object.keys(ResourceImpl)
const modelImplCache: Map<string, any> = new Map()
let lastId = 1

export default async function decorate<T extends IResource, D extends DecoratedResource>(data: T, store: any): Promise<IWritable<D>> {
  let keys: string[]
  let ModelImpl = null

  if ( !data ) {
    data = {} as T
  }

  if ( data.__decorated ) {
    throw new Error('Already decorated')
  }

  if ( !data.type ) {
    throw new Error(`Missing type: ${ JSON.stringify(data) }`)
  }

  if ( data.type !== 'resource' ) {
    if ( modelImplCache.has(data.type) ) {
      ModelImpl = modelImplCache.get(data.type)
    } else {
      try {
        // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
        ModelImpl = (await import(`../../models/${ data.type }.ts`))?.default
        modelImplCache.set(data.type, ModelImpl)
      } catch (e) {
        modelImplCache.set(data.type, null)
      }
    }
  }

  if ( ModelImpl ) {
    keys = uniq([...resourceKeys, ...Object.keys(ModelImpl)])
  } else {
    keys = resourceKeys
  }

  const out: IWritable<D> = <any>reactive(data)

  for ( const k of keys ) {
    let alsoInModel = false

    if ( ModelImpl?.[k] ) {
      alsoInModel = true
      Object.defineProperty(out, k, {
        configurable: true,
        enumerable:   false,
        value:        ModelImpl[k].call(out, store),
      })
    }

    if ( k in ResourceImpl ) {
      Object.defineProperty(out, alsoInModel ? `_super_${ k }` : k, {
        configurable: true,
        enumerable:   false,
        value:        (ResourceImpl as any)[k].call(out, store),
      })
    }
  }

  Object.defineProperty(out, '__decorated', { configurable: false, enumerable: false, value: lastId++ })

  return out
}
