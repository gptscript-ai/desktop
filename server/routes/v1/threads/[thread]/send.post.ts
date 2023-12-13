import { assistantFor, listMessages, useApi, waitForRun } from '@/server/utils/api'
import { usleep } from '@/utils/promise'

interface SendInput {
  message: string
}


export default defineEventHandler(async (event) => {
  const api = useApi()
  const json = await readBody(event) as SendInput

  const threadId = event.context.params!.thread || ''
  const thread = await api.beta.threads.retrieve(threadId)
  const assistantId = assistantFor(thread)

  await api.beta.threads.messages.create(threadId, {
    content: json.message,
    role: 'user',
  })

  const run = await waitForRun(threadId, assistantId)

  const messages = await listMessages(threadId)

  return {
    run,
    messages,
  }
})
