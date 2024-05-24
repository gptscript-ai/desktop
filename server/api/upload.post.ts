import * as path from 'node:path'
import fs from 'node:fs/promises'
import busboy from 'busboy'
import { workspaceDir } from '@/server/utils/fs'
import { fromArray } from '@/utils/array'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const threadId = fromArray<string>(q.thread as any)

  if (!threadId) {
    setResponseStatus(event, 400)

    return 'Thread not found'
  }

  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: getRequestHeaders(event) as any })

    bb.on('file', async (name, stream, info) => {
      const p = path.join(await workspaceDir(event, threadId), path.normalize(name))

      await fs.writeFile(p, stream)
    })

    event.node.req.pipe(bb)

    bb.on('finish', async () => {
      setResponseStatus(event, 200)
      resolve('ok')
    })

    bb.on('error', (err: any) => {
      setResponseStatus(event, 400)
      reject(err)
    })
  })
})
