export default defineEventHandler(async (event) => {
  const api = useApi()
  const threadId = event.context.params?.thread || ''

  const res = await api.beta.threads.del(threadId)

  return res
})
