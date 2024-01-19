import type { Component } from 'vue'
import type { IMetadata, IResource } from '@/composables/steve/types'
import type { JsonValue } from '@/utils/object'

declare global {
  interface MapString extends Record<string, string> {}
  interface MapMapJson extends Record<string, Record<string, JsonValue>> {}

  interface ICondition {
    error: string
    lastTransitionTime: string
    message: string
    observedGeneration: number
    reason: string
    status: string
    success: boolean
    transitioning: boolean
    type: string
  }

  interface IError {
    code: string
    message: string
    detail?: string
    status: number
  }
}
