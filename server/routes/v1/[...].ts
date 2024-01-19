import useProxy from '@/server/utils/proxy'

export default defineEventHandler(async (event) => {
  await new Promise((resolve, reject) => {
    const proxy = useProxy(useRuntimeConfig().public.api)

    proxy(event.node.req as any, event.node.res as any, (err?: unknown) => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
})
