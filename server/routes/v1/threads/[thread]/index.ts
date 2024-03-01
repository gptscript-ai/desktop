import type { ThreadMessage } from 'openai/resources/beta/threads/messages'

export default defineEventHandler(async (event) => {
  const api = useApi()
  const threadId = event.context.params?.thread || ''

  console.debug('Retrieving thread', threadId)
  const thread = await api.beta.threads.retrieve(threadId)
  console.debug('Got thread', threadId)

  const messages: ThreadMessage[] = []
  console.debug('Listing messages for', threadId)
  let res = await api.beta.threads.messages.list(threadId)
  console.debug('Got', res?.data?.length || 0, 'messages for ', threadId)

  messages.push(...res.data)
  while (res.hasNextPage() && res.body!.has_more ) {
    console.debug('Depaginating…')
    res = await res.getNextPage()
    console.debug('Got', res?.data?.length || 0, 'more messages for ', threadId)
    messages.push(...res.data)
  }

  console.debug('Returning thread', threadId)

  return {
    thread,
    messages,
  }
})
