import type { ThreadMessage } from 'openai/resources/beta/threads/messages'

export default defineEventHandler(async (event) => {
  const api = useApi()
  const threadId = event.context.params?.thread || ''
  const thread = await api.beta.threads.retrieve(threadId)

  const messages: ThreadMessage[] = []
  let res = await api.beta.threads.messages.list(threadId)
  messages.push(...res.data)
  while (res.hasNextPage()) {
    res = await res.getNextPage()
    messages.push(...res.data)
  }

  return {
    thread,
    messages,
  }
})
