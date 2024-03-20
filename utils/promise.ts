// Portions Copyright (c) 2014-2021 Rancher Labs, Inc. https://github.com/rancher/dashboard

import Queue from '@/utils/queue'

type PromiseFn = 'all' | 'allSettled'
type PromiseHash = Record<string, Promise<any>>
type HashOutput = Record<string, any>
interface EachEntry {
  item: any
  idx : number
}

async function _hash(hash: PromiseHash, fn: PromiseFn): Promise<HashOutput> {
  const keys = Object.keys(hash)
  const promises = Object.values(hash)

  let res = []

  if (fn === 'all') {
    res = await Promise.all(promises)
  } else if (fn === 'allSettled') {
    res = await Promise.allSettled(promises)
  }

  const out: HashOutput = {}

  for (let i = 0; i < keys.length; i++) {
    out[keys[i]] = res[i]
  }

  return out
}

export async function allHash(hash: PromiseHash): Promise<HashOutput> {
  return _hash(hash, 'all')
}

export async function allHashSettled(hash: PromiseHash): Promise<HashOutput> {
  return _hash(hash, 'allSettled')
}

export function eachLimit<T>(items: T[], limit: number, iterator: (item: T)=> Promise<any>, debug = false): Promise<any[]> {
  if (debug) {
    console.debug('eachLimit of', items.length, ' items', limit, 'at a time')
  }

  return new Promise((resolve, reject) => {
    const queue = new Queue<EachEntry>()
    let pending = 0
    let failed = false
    const out: any[] = []

    for (let i = 0; i < items.length; i++) {
      queue.enqueue({ item: items[i], idx: i })
    }

    process()

    function process() {
      if (debug) {
        console.debug(`process, queue=${ queue.size() }, pending=${ pending }, failed=${ failed }`)
      }

      if (failed) {
        return
      }

      if (queue.isEmpty() && pending === 0) {
        return resolve(out)
      }

      while (!queue.isEmpty() && pending < limit && !failed) {
        const { item, idx } = <EachEntry>queue.dequeue()

        if (debug) {
          console.debug('Running', item)
        }

        pending++

        iterator(item, idx).then((res: any) => {
          if (debug) {
            console.debug('Done', item)
          }

          out[idx] = res

          pending--
          process()
        }).catch((err: Error) => {
          if (debug) {
            console.error('Failed', err, item)
          }

          failed = true
          reject(err)
        })
      }
    }
  })
}

export async function eachLimitHash(items: string[], limit: number, iterator: (item: string)=> Promise<any>, debug = false): Promise<Record<string, any>> {
  const values = await eachLimit(items, limit, iterator, debug)
  const out: Record<string, any> = {}

  for (let i = 0; i < items.length; i++) {
    out[items[i]] = values[i]
  }

  return out
}

export async function usleep(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, delay)
  })
}

export interface Deferred<T> {
  promise: Promise<T>
  resolve: (val: any)=> void
  reject : (val: any)=> void
}

export function deferred<T>(): Deferred<T> {
  const out: Partial<Deferred<T>> = {}

  out.promise = new Promise<T>((resolve, reject) => {
    out.resolve = resolve
    out.reject = reject
  })

  return out as Deferred<T>
}
