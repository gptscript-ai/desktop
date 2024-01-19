import type { RequestHandler } from 'http-proxy-middleware'
import { createProxyMiddleware } from 'http-proxy-middleware'
import type { H3Event } from 'h3'
import { isDev } from '../../config/server'
import { randomStr } from '../../utils/string'

const cache: Record<string, RequestHandler> = {}

export default function useProxy(api: string, strip = 0) {
  const key = `${ strip }-${ api }`

  if ( !cache[key] ) {
    cache[key] = createProxy(api, strip)
  }

  return cache[key]
}

function createProxy(api: string, strip = 0) {
  const out = createProxyMiddleware({
    logLevel:        'warn',
    target:          api,
    changeOrigin:    true,
    followRedirects: false,
    secure:          !isDev,
    ws:              true,

    onProxyReq(proxyReq, req, res /* , opt */) {
      if ( !req.headers.reqid ) {
        req.headers.reqid = randomStr()
        res.setHeader('reqid', req.headers.reqid)
      }

      if ( strip ) {
        const parts = proxyReq.path.split('/')
        const removed = parts.splice(1, strip)

        proxyReq.path = parts.join('/')

        if ( removed.length ) {
          proxyReq.setHeader('x-api-url-prefix', `/${ removed.join('/') }`)
        }
      }

      proxyReq.setHeader('origin', api)
      proxyReq.setHeader('x-api-host', req.headers.host || '')
      proxyReq.setHeader('x-forwarded-proto', 'https')

      // console.info(`[${ req.headers.reqid }] Proxy onProxyReq`, proxyReq.path, JSON.stringify(proxyReq.getHeaders()))
    },

    onProxyReqWs(proxyReq, req) {
      if ( !req.headers.reqid ) {
        req.headers.reqid = randomStr()
      }

      if ( strip ) {
        const parts = proxyReq.path.split('/')
        const removed = parts.splice(1, strip)

        proxyReq.path = parts.join('/')

        if ( removed.length ) {
          proxyReq.setHeader('x-api-url-prefix', `/${ removed.join('/') }`)
        }
      }

      proxyReq.setHeader('origin', api)
      proxyReq.setHeader('x-api-host', req.headers.host || '')
      proxyReq.setHeader('x-forwarded-proto', 'https')

      // console.info(`[${ req.headers.reqid }] Proxy onProxyReqWs`, proxyReq.path, JSON.stringify(proxyReq.getHeaders()))
    },

    onProxyRes(proxyRes, req, res) {
      if (isDev) {
        proxyRes.headers['X-Frame-Options'] = 'ALLOWALL'
      }

      // console.info(`[${ res.getHeader('reqid') }] Proxy onProxyRes`, res.statusCode, JSON.stringify(proxyRes.headers))
    },

    onError(err, req, res) {
      console.error(`[${ req.headers?.reqid }] Proxy onError`, res.statusCode, JSON.stringify(err))
    },
  })

  return out
}
