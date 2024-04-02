export default defineEventHandler(async (event) => {
  const json = await readBody(event)

  const res = await apiFetch('/v1/assistants', 'POST', json)

  setResponseStatus(event, res._status)

  return res
})
