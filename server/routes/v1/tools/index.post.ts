export default defineEventHandler(async (event) => {
  const json = await readBody(event)
  const res = await apiFetch('/v1/rubra/x/tools', 'POST', json)

  return res
})
