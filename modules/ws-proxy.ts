import type { IncomingMessage } from 'node:http'
import type { Socket } from 'node:net'
import type { Nuxt } from '@nuxt/schema'
import type { RequestHandler } from 'http-proxy-middleware'
import useProxy from '../server/utils/proxy'
import { randomStr } from '../utils/string'
import { api } from '../config/server'

export default (opt: any, nuxt: Nuxt) => {
  nuxt.hook('listen', (server) => {
    server.on('upgrade', async (req: IncomingMessage, socket: Socket, head: any) => {
      let proxy: RequestHandler

      if ( !req.headers.reqid ) {
        req.headers.reqid = randomStr()
      }

      // console.info(`[${ req.headers.reqid }] WS Proxy 3 from`, req.url, 'to', api)

      proxy = useProxy(api)

      return proxy.upgrade!(req as any, socket, head)
    })
  })
}
