import { emulateThreads, useApi } from '@/server/utils/api'
import type { ThreadCreateParams  } from 'openai/resources/beta/threads'

export default defineEventHandler(async (event) => {
  const api = useApi()
  let messages: ThreadCreateParams.Message[] = []

  const thread = await api.beta.threads.create({messages})

  if ( emulateThreads() ) {
    const cookies = parseCookies(event)
    const ids = (cookies['RUBRA_THREADS']||'').split(',').filter(x => !!x)

    ids.push(thread.id)

    setCookie(event, 'RUBRA_THREADS', ids.join(','), {
      maxAge: 86400*365,
      path: '/'
    })
  }

  return thread
})
