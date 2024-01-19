import type { RouteLocationRaw, RouteParamsRaw } from 'vue-router'
import type { ComputedRef } from 'vue'
import { computed, reactive, toRaw, unref } from 'vue'
import omitBy from 'lodash-es/omitBy.js'
import pickBy from 'lodash-es/pickBy.js'
import dayjs from 'dayjs'
import { removeAt } from '@/utils/array'

// import { downloadFile, generateZip } from '@/utils/download'
// import { eachLimit } from '@/utils/promise'
// import type { JsonDict, JsonValue } from '@/utils/object'
import type { JsonValue } from '@/utils/object'
import { clone } from '@/utils/object'
import { sortableNumericSuffix } from '@/utils/sort'

import type { IAction, IAnnotations, ILabels, IResource } from '@/composables/steve/types'

// import type { IRequestOpt } from '@/composables/steve/server'
// import { useContext } from '@/stores/context'
// import { toNice } from '@/config/schemas'
import type { SteveStoreType } from '@/stores/steve'
import {
  detailRoute, details, editable, loadAfterSave, toNice,
} from '@/config/schemas'
import { colorForState, labelForState, sortableForState } from '@/utils/resource-state'
import type { IRequestOpt } from '@/composables/steve/server'
import decorate from '@/composables/steve/decorate'
import { matchesSomeRegex } from '@/utils/string'
import { ANNOTATIONS_TO_IGNORE_REGEX, LABELS_TO_IGNORE_REGEX } from '@/config/labels-annotations'
import { cleanForDiff } from '@/composables/steve/normalize'

export type UnComputed<T> = T extends ComputedRef<infer U> ? U : T

type IDecoratedResource = {
  // [k in keyof typeof Resource]: ReturnType<typeof Resource[k]>
  [k in keyof typeof Resource]: ReturnType<typeof Resource[k]>
}

declare global {
  export interface DecoratedResource extends IResource, IDecoratedResource {}
}

const Resource = {
  // -------------------------------
  // Editing
  // -------------------------------
  clone(this: DecoratedResource, store: any) {
    return async () => {
      const json = JSON.stringify(toRaw(this))
      const neu = await decorate(JSON.parse(json), store) as DecoratedResource

      Object.defineProperty(neu, '__original', { configurable: false, enumerable: false, value: json })

      return neu
    }
  },

  refresh(this: DecoratedResource, store: SteveStoreType) {
    return async () => {
      return store.find(this.id, { force: true })
    }
  },

  pollTransitioning(this: DecoratedResource) {
    return async () => {
      if ( this.metadata.state?.transitioning || this.metadata.state?.error ) {
        await usleep(5000)
        await this.refresh()
        // Refresh will trigger a load which re-calls this if it's still transitioning…
      }
    }
  },

  update(this: DecoratedResource) {
    return (neu: JsonValue) => {
      for ( const k of Object.keys(this) ) {
        Object.defineProperty(this, k, { configurable: true, enumerable: true, value: undefined })
      }

      const writable = reactive(toRaw(this))

      Object.assign(writable, clone(neu))

      return this
    }
  },

  save(this: DecoratedResource, store: SteveStoreType) {
    return async (opt: IRequestOpt = {}) => {
      const forNew = !this.id

      if ( !opt.url ) {
        if ( forNew ) {
          const schema = store.schema

          opt.url = schema.linkFor('collection')

          if ( schema.attributes?.namespaced && this.metadata?.namespace ) {
            opt.url += `/${ this.metadata.namespace }`
          }
        } else {
          opt.url = this.linkFor('update') || this.linkFor('self')
        }
      }

      if ( !opt.method ) {
        opt.method = ( forNew ? 'post' : 'put' )
      }

      if ( !opt.headers ) {
        opt.headers = {}
      }

      if ( !opt.headers['content-type'] ) {
        opt.headers['content-type'] = 'application/json'
      }

      if ( !opt.headers.accept ) {
        opt.headers.accept = 'application/json'
      }

      opt.body = { ...this }

      try {
        const res = await store.server.request({ ...opt, retry: 0 })

        this.update(res)

        if ( forNew && loadAfterSave(this.type) ) {
          if ( store.map[this.id] ) {
            // With really unlucky timing the websocket create event might
            // see the resource and add a copy before we have a change to add it here.
            // If this happens, drop that copy and use this one.
            console.error(`Warning: Newly created ${ this.type } ${ this.id } is already in the store`)
            removeObject(store.list, store.map[this.id])
            delete store.map[this.id]
          }

          addObject(store.list, this)
          store.map[this.id] = this
        }

        // console.info('### Resource Save', this.type, this.id)
      } catch (e: any) {
        if ( opt.retry !== 0 && this.type && this.id && this.__original && e.status === 409) {
          // If there's a conflict, try to load the new version
          const fromServer = await store.find(this.id, { force: true })

          const orig = cleanForDiff(JSON.parse(this.__original))
          const user = cleanForDiff(this)
          const server = cleanForDiff(fromServer)

          const userChange = changeset(orig, user)
          const serverChange = changeset(orig, server)
          const conflicts = changesetConflicts(serverChange, userChange)

          console.info('Server Change', serverChange)
          console.info('User Change', userChange)

          if ( conflicts.length ) {
            console.error('Conflicts', conflicts)

            return Promise.reject(e)
          } else {
            this.metadata.resourceVersion = fromServer.metadata.resourceVersion
            applyChangeset(this, serverChange)

            return this.save({ ...opt, retry: 0 })
          }
        }

        return Promise.reject(e)
      }

      return this
    }
  },

  // -------------------------------
  // Names
  // -------------------------------
  nameDisplay(this: DecoratedResource) {
    return computed((): string => (this.spec?.displayName as string) || this.metadata?.name || this.id)
  },

  nameSort(this: DecoratedResource) {
    return computed(() => {
      const name = unref(this.nameDisplay) as string

      return `${ sortableNumericSuffix(this.metadata.namespace!) }/${ sortableNumericSuffix(name).toLowerCase() }`
    })
  },

  // -------------------------------
  // State
  // -------------------------------
  state(this: DecoratedResource) {
    return computed((): string => {
      if ( !this.id ) {
        return ''
      }

      if ( this.metadata?.deletionTimestamp ) {
        return 'removing'
      }

      return this.metadata?.state?.name || 'unknown'
    })
  },

  isActive(this: DecoratedResource) {
    return computed(() => {
      return ['active', 'running'].includes(unref(this.state)) && !this.metadata.state?.transitioning
    })
  },

  isRemoving(this: DecoratedResource) {
    return computed(() => {
      return unref(this.state) === 'removing' && this.metadata.state?.transitioning
    })
  },

  stateDisplay(this: DecoratedResource) {
    return computed(() => {
      const state = unref(this.state)

      return labelForState(state)
    })
  },

  stateColor(this: DecoratedResource) {
    return computed(() => {
      const state = unref(this.state)

      return colorForState(state, this.metadata.state?.error || false, this.metadata.state?.transitioning || false)
    })
  },

  stateIcon(this: DecoratedResource) {
    return computed(() => {
      const color = unref(this.stateColor)

      switch (color) {
        case 'danger':
          return 'i-carbon-warning-filled'
        case 'warning':
          return 'i-carbon-warning'
        case 'info':
          return 'i-carbon-information'
        case 'success':
        case 'default':
          return 'i-carbon-checkmark-filled'
        default:
          return ''
      }
    })
  },

  stateSort(this: DecoratedResource) {
    return computed(() => {
      const color = unref(this.stateColor)

      const label = unref(this.stateDisplay)

      return sortableForState(color, label)
    })
  },

  stateDetail(this: DecoratedResource) {
    return computed(() => {
      if ( this.metadata.state?.transitioning || this.metadata.state?.error ) {
        return this.metadata.state.message || ''
      }

      return ''
    })
  },

  // hasCondition(condition: string) {
  //   return this.isCondition(condition, null)
  // },

  isCondition(this: DecoratedResource) {
    return (condition: string, withStatus: string | null = 'True') => {
      if ( !this.status || !this.status.conditions ) {
        return false
      }

      const entry = findBy((this.status.conditions || []), 'type', condition)

      if ( !entry ) {
        return false
      }

      if ( !withStatus ) {
        return true
      }

      return (entry.status || '').toLowerCase() === `${ withStatus }`.toLowerCase()
    }
  },

  // waitForCondition(name: string, withStatus = 'True', timeoutMs = DEFAULT_WAIT_TIMEOUT, intervalMs = DEFAULT_WAIT_INTERVAL) {
  //   return this.waitForTestFn(() => {
  //     return this.isCondition(name, withStatus)
  //   }, `condition ${ name }=${ withStatus }`, timeoutMs, intervalMs)
  // }

  // -------------------------------
  // Links
  // -------------------------------
  linkFor(this: DecoratedResource) {
    return (name: string) => {
      let out = (this.links || {})[name]

      if ( out && out.startsWith('http://localhost') ) {
        out = out.replace(/^http/, 'https')
      }

      return out
    }
  },

  hasLink(this: DecoratedResource) {
    return (name: string) => {
      return !!this.linkFor(name)
    }
  },

  hasAction(this: DecoratedResource) {
    return (name: string) => {
      return !!this.actionLinkFor(name)
    }
  },

  actionLinkFor(this: DecoratedResource) {
    return (name: string) => {
      return (this.actions || {})[name]
    }
  },

  followLink(this: DecoratedResource, store: SteveStoreType) {
    return (linkName: string, opt: IRequestOpt = {}) => {
      if ( !opt.url ) {
        opt.url = this.linkFor(linkName)
      }

      if ( !opt.url ) {
        throw new Error(`Unknown link ${ linkName } on ${ this.type } ${ this.id }`)
      }

      return store.server.request(opt)
    }
  },

  serverAction(this: DecoratedResource, store: SteveStoreType) {
    return (actionName: string, body: JsonValue = {}, opt: IRequestOpt = {}) => {
      if ( !opt.url ) {
        opt.url = (this.actions || {})[actionName]
      }

      if ( !opt.method ) {
        opt.method = 'POST'
      }

      opt.body = body

      if ( !opt.url ) {
        throw new Error(`Unknown action ${ actionName } on ${ this.type } ${ this.id }`)
      }

      return store.server.request(opt)
    }
  },

  // -------------------------------
  // Labels
  // -------------------------------
  userLabels(this: DecoratedResource) {
    return computed(() => {
      const all = this.metadata?.labels || {}

      return <ILabels>omitBy(all, (_, key) => {
        return matchesSomeRegex(key, LABELS_TO_IGNORE_REGEX)
      })
    })
  },

  systemLabels(this: DecoratedResource) {
    return computed(() => {
      const all = this.metadata?.labels || {}

      return <ILabels>pickBy(all, (_, key) => {
        return matchesSomeRegex(key, LABELS_TO_IGNORE_REGEX)
      })
    })
  },

  getLabel(this: DecoratedResource) {
    return (key: string) => {
      if ( !this.metadata?.labels ) {
        return undefined
      }

      return this.metadata.labels[key]
    }
  },

  setLabels(this: DecoratedResource) {
    return (val: ILabels) => {
      if ( !this.metadata ) {
        this.metadata = {}
      }

      this.metadata.labels = { ...unref(this.systemLabels), ...val }
    }
  },

  setLabel(this: DecoratedResource) {
    return (key: string, val: string | null | undefined) => {
      if ( typeof val === 'string' ) {
        if ( !this.metadata ) {
          this.metadata = {}
        }

        if ( !this.metadata.labels ) {
          this.metadata.labels = {}
        }

        this.metadata.labels[key] = <string>val
      } else if ( this.metadata?.labels ) {
        delete this.metadata.labels[key]
      }
    }
  },

  // -------------------------------
  // Annotations
  // -------------------------------
  userAnnotations(this: DecoratedResource) {
    return computed(() => {
      const all = this.metadata?.annotations || {}

      return <IAnnotations>omitBy(all, (_, key) => {
        return matchesSomeRegex(key, ANNOTATIONS_TO_IGNORE_REGEX)
      })
    })
  },

  systemAnnotations(this: DecoratedResource) {
    return computed(() => {
      const all = this.metadata?.annotations || {}

      return <IAnnotations>pickBy(all, (_, key) => {
        return matchesSomeRegex(key, ANNOTATIONS_TO_IGNORE_REGEX)
      })
    })
  },

  getAnnotation(this: DecoratedResource) {
    return (key: string) => {
      if ( !this.metadata?.annotations ) {
        return undefined
      }

      return this.metadata.annotations[key]
    }
  },

  setAnnotations(this: DecoratedResource) {
    return (val: IAnnotations) => {
      if ( !this.metadata ) {
        this.metadata = {}
      }

      this.metadata.annotations = { ...unref(this.systemAnnotations), ...val }
    }
  },

  setAnnotation(this: DecoratedResource) {
    return (key: string, val: string | null | undefined) => {
      if ( typeof val === 'string' ) {
        if ( !this.metadata ) {
          this.metadata = {}
        }

        if ( !this.metadata.annotations ) {
          this.metadata.annotations = {}
        }

        this.metadata.annotations[key] = <string>val
      } else if ( this.metadata?.annotations ) {
        delete this.metadata.annotations[key]
      }
    }
  },

  // -------------------------------
  // Action List
  // -------------------------------
  canRemove(this: DecoratedResource) {
    return computed(() => <boolean> this.hasLink('remove'))
  },

  confirmRemove(this: DecoratedResource) {
    return computed(() => true)
  },

  canClone(this: DecoratedResource) {
    return computed(() => false)
  },

  canDetail(this: DecoratedResource) {
    return computed(() => <boolean> details(this.type) && this.hasLink('self'))
  },

  canUpdate(this: DecoratedResource) {
    return computed(() => <boolean> editable(this.type) && this.hasLink('update'))
  },

  canYaml(this: DecoratedResource) {
    return computed(() => <boolean> this.hasLink('view'))
  },

  availableActions(this: DecoratedResource, store: SteveStoreType) {
    return computed(() => {
      const canCreate = unref(store.schema.canCreate)
      const canUpdate = unref(this.canUpdate)
      const canClone = unref(this.canClone)
      // const canYaml = unref(this.canYaml)
      const canRemove = unref(this.canRemove)
      const confirmRemove = unref(this.confirmRemove)
      const isDev = true

      const all: IAction[] = [
        { divider: true },
        {
          action:  'goToEdit',
          label:   'Edit',
          icon:    'edit',
          enabled: canUpdate,
        },
        // {
        //   action:  canUpdate ? 'goToEditYaml' : 'goToViewYaml',
        //   label:   canUpdate ? 'Edit YAML' : 'View YAML',
        //   icon:    canUpdate ? 'text-annotation-toggle' : 'document-view',
        //   enabled: canYaml && (canUpdate || canDetail),
        // },
        {
          action:  'goToClone',
          label:   'Clone',
          icon:    'copy',
          enabled:  canClone && canCreate,
        },
        { divider: true },
        // {
        //   action:     'download',
        //   label:      'Download',
        //   icon:       'document-download',
        //   bulkable:   true,
        //   bulkAction: 'downloadBulk',
        //   enabled:    isDev && canYaml,
        //   weight:     -9,
        // },
        {
          action:  'viewInApi',
          label:   'View in API',
          icon:    'api-1',
          enabled:  isDev && this.hasLink('self'),
        },
        {
          action:     'remove',
          confirm:    confirmRemove ? () => `Are you sure you want to remove '${ this.nameDisplay }'?` : false,
          label:      'Remove',
          icon:       'trash-can',
          bulkable:   true,
          enabled:    canRemove,
          bulkAction: 'promptRemove',
          weight:     -10, // Delete always goes last
        },
      ]

      return all
    })
  },

  filteredActions(this: DecoratedResource) {
    return computed(() => {
      const all = unref(this.availableActions)

      // Remove disabled items and consecutive dividers
      let last = false

      const out = all.filter((item) => {
        if ( item.enabled === false ) {
          return false
        }

        const cur = item.divider || false
        const ok = !cur || (cur && !last)

        last = cur

        return ok
      })

      // Remove dividers at the beginning
      while ( out.length && out[0].divider ) {
        out.shift()
      }

      // Remove dividers at the end
      while ( out.length && out[out.length - 1].divider ) {
        out.pop()
      }

      // Remove consecutive dividers in the middle
      for ( let i = 1; i < out.length; i++ ) {
        if ( out[i].divider && out[i - 1].divider ) {
          removeAt(out, i, 1)
          i--
        }
      }

      return out
    })
  },

  // -------------------------------
  // Actions
  // -------------------------------
  doAction(this: DecoratedResource) {
    return (action: string, ...rest: any[]) => {
      if ( typeof this[action] === 'function' ) {
        this[action](...rest)
      }
    }
  },

  goToDetail(this: DecoratedResource) {
    return () => {
      navigateTo(unref(this.detailLocation))
    }
  },

  viewInApi(this: DecoratedResource) {
    return () => {
      window.open(this.linkFor('self'), '_blank')
    }
  },

  remove(this: DecoratedResource, store: SteveStoreType) {
    return async (opt: IRequestOpt = {}) => {
      if ( !opt.url ) {
        opt.url = this.linkFor('self')
      }

      opt.method = 'delete'

      const res = await store.server.request(opt)

      if ( res?._status === 204 ) {
        store.remove(this.id)
      }
    }
  },

  detailLocation(this: DecoratedResource, store: SteveStoreType) {
    // Outside computed and dereferenced so they never change on this instance
    const account = store.server?.referenceId

    return computed(() => {
      // ID can change, so inside computed
      const [project, id] = splitLimit(this.id, '/', 2)
      const type = toNice(this.type)

      const params: RouteParamsRaw = {
        account,
        project,
        slug: [type, id],
      }

      return <RouteLocationRaw>{
        name:  detailRoute(this.type, this),
        params,
        query: {},
      }
    })
  },
}

export default Resource


export function keyFor(resource: IResource): string {
  const m = resource.metadata

  if ( m?.uid ) {
    return m.uid
  }

  if ( m?.namespace ) {
    return `${ resource.type }/${ m.namespace }/${ m.name }`
  }

  if ( resource.id ) {
    return `${ resource.type }/${ resource.id }`
  }

  // This won't be consistent and messes up SSR, and shouldn't get hit
  // for real resources, but is still better than nothing if it does
  return `${ resource.type }/${ Math.random() }`
}
