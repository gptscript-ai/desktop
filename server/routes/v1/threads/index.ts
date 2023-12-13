import type { Thread } from 'openai/resources/beta/threads'
import { emulateThreads, useApi } from '@/server/utils/api'

export default defineEventHandler(async (event) => {
  const api = useApi()

  const threads: Thread[] = []

  if (emulateThreads()) {
    const cookies = parseCookies(event)
    const ids = (cookies.RUBRA_THREADS || '').split(',').filter(x => !!x)

    for (const id of ids)
      threads.push(await api.beta.threads.retrieve(id))
  }
  else {
    throw new Error('@TODO implement real threads API')
  }

  return threads
})
