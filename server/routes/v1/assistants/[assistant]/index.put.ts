export default defineEventHandler(async (event) => {
  const api = useApi()
  const assistantId = event.context.params?.assistant || ''
  const json = await readBody(event)

  json.tools = (json.tools || []).map((x) => { return { type: x } }) as any
  // json.gptscript_tools = (json.gptscript_tools || []).map(x => { return {type: x} }) as any

  delete json.created_at
  delete json.id
  delete json.object

  console.debug('Update assistant', assistantId, json)

  const res = await apiFetch(`/v1/rubra/assistants/${encodeURIComponent(assistantId)}`, 'POST', json)

  setResponseStatus(event, res._status)

  return res
})
