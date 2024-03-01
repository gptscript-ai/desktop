export default defineEventHandler(async (event) => {
  const api = useApi()
  const assistantId = event.context.params?.assistant || ''

  console.debug('Delete assistant', assistantId)

  const res = await api.beta.assistants.del(assistantId)

  return res
})
