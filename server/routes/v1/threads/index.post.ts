import type { ThreadCreateParams } from 'openai/resources/beta/threads'
import { useApi, waitForRun } from '@/server/utils/api'

interface CreateInput {
  assistantId: string
  message?: string
}

export default defineEventHandler(async (event) => {
  const api = useApi()
  const json = await readBody(event) as CreateInput
  const messages: ThreadCreateParams.Message[] = []

  if (json.message)
    messages.push({ content: json.message, role: 'user' })

  const thread = await api.beta.threads.create({
    messages,
    metadata: { assistantId: json.assistantId },
  })

  if (json.message)
    await waitForRun(thread.id, json.assistantId)

  return thread
})
