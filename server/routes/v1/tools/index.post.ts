export default defineEventHandler(async (event) => {
  const json = await readBody(event)
  const res = await apiFetch('/v1/x-tools', 'POST', json)

  setResponseStatus(event, res._status)

  return res
})
