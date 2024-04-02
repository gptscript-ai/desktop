export default defineEventHandler(async (event) => {
  const assistantId = event.context.params?.assistant || ''
  const json = await readBody(event)

  delete json.created_at
  delete json.id
  delete json.object

  console.debug('Update assistant', assistantId, json)

  const res = await apiFetch(`/v1/assistants/${ encodeURIComponent(assistantId) }`, 'POST', json)

  setResponseStatus(event, res._status)

  return res
})
