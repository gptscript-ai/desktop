import crypto from 'node:crypto'

export async function sha256(input: string | Uint8Array) {
  if ( process.server || typeof window?.crypto?.subtle?.digest === 'undefined' ) {
    return crypto.createHash('sha256').update(input).digest('hex')
  }

  let source: Uint8Array

  if ( typeof input === 'string' ) {
    source = new TextEncoder().encode(input)
  } else {
    source = input
  }

  const buf = await window.crypto.subtle.digest('SHA-256', source)
  const ary = Array.from(new Uint8Array(buf))
  const out = ary.map(x => x.toString(16).padStart(2, '0')).join('')

  return out
}
