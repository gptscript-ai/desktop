export default defineEventHandler(async (event) => {
  const assistantId = event.context.params?.assistant || ''

  if (!assistantId) {
    setResponseStatus(event, 404)
    throw new Error('Assistant not found')
  }

  const api = useApi()
  const assistant = await api.beta.assistants.retrieve(assistantId)

  return assistant
})
