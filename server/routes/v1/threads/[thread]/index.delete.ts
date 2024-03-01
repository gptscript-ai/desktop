export default defineEventHandler(async (event) => {
  const api = useApi()
  const threadId = event.context.params?.thread || ''

  const res = await api.beta.threads.del(threadId)

  if (emulateThreads()) {
    const cookies = parseCookies(event)
    const ids = (cookies.RUBRA_THREADS || '').split(',').filter(x => !!x && x !== threadId)

    setCookie(event, 'RUBRA_THREADS', ids.join(','), {
      maxAge: 86400 * 365,
      path: '/',
    })
  }

  return res
})
