import type { Thread } from 'openai/resources/beta/threads'
import { emulateThreads, useApi } from '@/server/utils/api'
import { removeObject } from '~/utils/array'

export default defineEventHandler(async (event) => {
  const api = useApi()

  const threads: Thread[] = []

  if (emulateThreads()) {
    const cookies = parseCookies(event)
    const ids = (cookies.RUBRA_THREADS || '').split(',').filter(x => !!x)
    let changed = false

    for (const id of ids)
      try {
        const thread = await api.beta.threads.retrieve(id)
        threads.push(thread)
      } catch (e) {
        removeObject(ids, id)
        changed = true
      }

    if ( changed ) {
      setCookie(event, 'RUBRA_THREADS', ids.join(','), {
        maxAge: 86400 * 365,
        path: '/',
      })
    }
  }
  else {
    throw new Error('@TODO implement real threads API')
  }

  return threads
})
