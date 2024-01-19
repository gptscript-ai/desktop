import { computed } from 'vue'
import { normalizeType } from '@/composables/steve/normalize'
import type { ISchema } from '@/composables/steve/types'
import { creatable } from '@/config/schemas'

type IDecoratedSchema = {
  [k in keyof typeof Schema]: ReturnType<typeof Schema[k]>
}

declare global {
  export interface DecoratedSchema extends DecoratedResource, ISchema, IDecoratedSchema {}
}

export const SIMPLE_TYPES = [
  'string',
  'multiline',
  'masked',
  'password',
  'float',
  'number',
  'int',
  'integer',
  'date',
  'blob',
  'boolean',
  'version',
]

export function typeRef(type: string, str: string): string | undefined {
  const re = new RegExp(`^${ type }\\[(.*)\\]$`)
  const match = str.match(re)

  if ( match ) {
    return match[1]
  }
}

const Schema = {
  normalizedId(this: DecoratedSchema) {
    return computed(() => normalizeType(this.id))
  },

  normalizedGroup(this: DecoratedSchema) {
    return computed(() => {
      if ( this.attributes?.group ) {
        return normalizeType(this.attributes.group)
      }

      return ''
    })
  },

  canCreate(this: DecoratedSchema) {
    return computed(() => {
      if ( creatable(this.id) && this.collectionMethods.find(x => x.toLowerCase() === 'post') ) {
        return true
      }

      return false
    })
  },
}

export default Schema
