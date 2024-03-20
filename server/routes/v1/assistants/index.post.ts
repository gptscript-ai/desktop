export default defineEventHandler(async (event) => {
  const json = await readBody(event)

  json.tools = (json.tools || []).map((x) => {
    return { type: x }
  }) as any
  // json.gptscript_tools = (json.gptscript_tools || []).map(x => { return {type: x} }) as any

  const res = await apiFetch('/v1/rubra/assistants', 'POST', json)

  setResponseStatus(event, res._status)

  return res
})
