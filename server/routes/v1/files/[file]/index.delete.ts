export default defineEventHandler(async (event) => {
  const api = useApi()
  const fileId = event.context.params?.file || ''

  const res = await api.files.del(fileId)

  return res
})
