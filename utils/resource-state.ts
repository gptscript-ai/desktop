import { ucFirst } from '@/utils/string'

export const DEFAULT_COLOR = 'success'

export type StateColor = 'danger' | 'warning' | 'info' | 'success' | 'info-ok' | 'default' | 'orphaned'

type StateOption = {
  color?: StateColor
  icon?: string
  remap?: string
  label?: string
  labelKey?: string
}

export const STATES: Record<string, StateOption> = {
  // activating:  { color: 'info' },
  // active:      { color: 'success' },
  // available:   { color: 'info' },
  // bound:       { color: 'success' },
  // completed:   { color: 'success' },
  // disabled:    { remap: 'inactive' },
  off:         { label: 'Disabled', color: 'warning' },
  // released:    { color: 'danger' },
  removing:    { color: 'warning' },
  // running:     { color: 'success' },
  stopped:     { color: 'info' },
  // unavailable: { color: 'danger' },
}

const STATE_SORT_ORDER: Record<StateColor, number> = {
  'danger':   1,
  'warning':  2,
  'info':     3,
  'success':  4,
  'info-ok':  5,
  'default':  6,
  'orphaned': 7,
}

function resolveRemaps(name: string): string {
  if ( !name ) {
    return resolveRemaps('active')
  }

  const remapped = STATES[name]?.remap

  if ( remapped ) {
    return resolveRemaps(remapped)
  }

  return name.toLowerCase()
}

export function colorForState(name: string, isError: boolean, isTransitioning: boolean): StateColor {
  const key = resolveRemaps(name)
  const force = STATES[key]?.color

  if ( force ) {
    return force
  }

  if ( isError ) {
    return 'danger'
  }

  if ( isTransitioning ) {
    return 'info'
  }

  return DEFAULT_COLOR
}

export function labelForState(name: string): string {
  const key = resolveRemaps(name)
  const entry = STATES[key]
  let out: string

  if ( entry ) {
    if ( entry.labelKey ) {
      // @TODO use translations
    }

    if ( !out ) {
      out = STATES[key].label
    }
  }

  if ( !out ) {
    out = key.split(/-/).map(ucFirst).join('-')
  }

  return out
}

export function sortableForState(color: StateColor, label?: string) {
  const order = STATE_SORT_ORDER[color] || 99

  return `${ order } ${ (label || '').toLowerCase() }`
}
