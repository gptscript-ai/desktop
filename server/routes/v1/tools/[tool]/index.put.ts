export default defineEventHandler(async (event) => {
  const toolId = event.context.params?.tool || ''
  const json = await readBody(event)

  const res = await apiFetch(`/v1/rubra/x/tools/${ toolId }`, 'PUT', json)

  return res
})
