import crypto from 'node:crypto'
import isArray from 'lodash-es/isArray'

const alpha = 'abcdefghijklmnopqrstuvwxyz'
const num = '0123456789'
const sym = '!@#$%^&*()_+-=[]{};:,./<>?|'

export const Charsets = {
  NUMERIC:         num,
  NO_VOWELS:       'bcdfghjklmnpqrstvwxz2456789',
  ALPHA:           alpha + alpha.toUpperCase(),
  ALPHA_NUM:       alpha + alpha.toUpperCase() + num,
  ALPHA_NUM_LOWER: alpha + num,
  ALPHA_LOWER:     alpha,
  ALPHA_UPPER:     alpha.toUpperCase(),
  HEX:             `${ num }ABCDEF`,
  PASSWORD:        alpha + alpha.toUpperCase() + num + alpha + alpha.toUpperCase() + num + sym,
  // ^-- includes alpha / ALPHA / num twice to reduce the occurrence of symbols
}

export function fromArray<T>(arg: T | T[] | undefined, def?: T): T {
  if (isArray(arg)) {
    return (arg as T[])[0] || (def as T)
  } else {
    return (arg as T) || (def as T)
  }
}

export function random32s(count: number): number[] {
  if (count <= 0) {
    throw new Error('Can\'t generate a negative number of numbers')
  }

  if (Math.floor(count) !== count) {
    throw new Error('Count should be an integer')
  }

  const out = []
  let i: number

  // eslint-disable-next-line node/prefer-global/process
  if ((typeof process !== 'undefined' && process.server) || typeof window === 'undefined') {
    for (i = 0; i < count; i++) {
      out[i] = crypto.randomBytes(4).readUInt32BE(0)
    }
  } else if (window.crypto && window.crypto.getRandomValues) {
    const tmp = new Uint32Array(count)

    window.crypto.getRandomValues(tmp)
    for (i = 0; i < tmp.length; i++) {
      out[i] = Math.round(tmp[i])
    }
  } else {
    for (i = 0; i < count; i++) {
      out[i] = Math.round(Math.random() * 4294967296)
    } // Math.pow(2,32);
  }

  return out
}

export function random32(): number {
  return random32s(1)[0]
}

export function randomStr(length = 16, chars = Charsets.ALPHA_NUM): string {
  if (!chars.length) {
    throw new Error('Charset is empty')
  }

  return random32s(length).map((val) => {
    return chars[val % chars.length]
  }).join('')
}

export function splitLimit(str: string, separator: string, limit: number): string[] {
  const split = str.split(separator)

  if (split.length < limit) {
    return split
  }

  return [...split.slice(0, limit - 1), split.slice(limit - 1).join(separator)]
}
