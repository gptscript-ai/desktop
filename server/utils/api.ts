import OpenAI from 'openai'
import { Thread } from 'openai/resources/beta/threads'
import type { ThreadMessage } from 'openai/resources/beta/threads/messages'
import { usleep } from '@/utils/promise'

export function emulateThreads() {
  const cfg = useRuntimeConfig()
  return !!cfg.api || cfg.api.includes('api.opanai.com')
}

export function useApi() {
  const cfg = useRuntimeConfig()

  if (!cfg.apiKey)
    throw new Error('API Key not set')

  const client = new OpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.api || 'https://api.openai.com/v1',
    organization: cfg.organization,
  })

  return client
}

export async function listMessages(threadId: string) {
  const api = useApi()
  const messages: ThreadMessage[] = []

  console.debug('Listing messages for', threadId)
  let res = await api.beta.threads.messages.list(threadId)
  console.debug('Got', res.data.length, 'messages')

  messages.push(...res.data)
  while (res.hasNextPage() && res.body!.has_more) {
    console.debug('Depaginating…')
    res = await res.getNextPage()
    console.debug('Got', res.data.length, 'messages')
    messages.push(...res.data)
  }

  console.debug('Returning', messages.length, 'messages')
  return messages
}

export function assistantFor(thread: Thread) {
  const assistantId = ((thread.metadata || {}) as Record<string,string>).assistantId

  return assistantId
}

const finalized = ['cancelled', 'failed', 'completed', 'expired']
export async function waitForRun(threadId: string, assistantId: string) {
  const api = useApi()
  let run = await api.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  })

  while (!finalized.includes(run.status)) {
    await usleep(500)
    run = await api.beta.threads.runs.retrieve(threadId, run.id)
    console.log(run.id, run.status)
  }

  return run
}
