export default defineEventHandler(async (event) => {
  const toolId = event.context.params?.tool || ''

  const res = await apiFetch(`/v1/rubra/x/tools/${toolId}`)

  return res
})
