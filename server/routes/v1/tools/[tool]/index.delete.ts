export default defineEventHandler(async (event) => {
  const toolId = event.context.params?.tool || ''

  const res = await apiFetch(`/v1/x-tools/${ toolId }`, 'DELETE')

  return res
})
