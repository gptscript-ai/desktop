import { assistantFor, listMessages, useApi, waitForRun } from '@/server/utils/api'

interface SendInput {
  message: string
}

export default defineEventHandler(async (event) => {
  const api = useApi()
  const json = await readBody(event) as SendInput

  const threadId = event.context.params!.thread || ''
  const thread = await api.beta.threads.retrieve(threadId)
  const assistantId = assistantFor(thread)

  console.debug('Sending message to', threadId)
  await api.beta.threads.messages.create(threadId, {
    content: json.message,
    role:    'user',
  })

  console.debug('Running', threadId)
  const run = await waitForRun(threadId, assistantId)

  console.debug('Ran', run)

  if (run.status === 'failed') {
    // setResponseStatus(event, 500)

    return { run }
  }

  console.debug('Listing Messages for', threadId)
  const messages = await listMessages(threadId)

  console.debug('Got', messages.length, 'messages')

  return {
    run,
    messages,
  }
})
