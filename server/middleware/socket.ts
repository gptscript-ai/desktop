import { Server, type Socket } from 'socket.io'
import { Client, type Client as ClientType } from '@gptscript-ai/gptscript'
import handlers, { type Handler, type Handlers } from '../messages'

interface AppSocket {
  emit: (chanel: string, message: string) => void
}
const appSocket = {
  emit: (channel: string, message: string) => {
    console.info('Not initiated yet', channel, message)
  },
}

declare module 'h3' {
  interface H3EventContext {
    appSocket: AppSocket
    socket:    Socket
    gpt:       ClientType
  }
}

export default defineEventHandler(async (event) => {
  const client = new Client(undefined, process.env.GPTSCRIPT_BIN || './binaries/gptscript-universal-apple-darwin')

  event.context.appSocket = appSocket
  event.context.gpt = client
  await sessionDir(event)

  const g = globalThis as any

  if (g.io) {
    return
  }

  console.log('Starting socket middleware')

  const node = event.node

  g.io = new Server(node.res.socket?.server)

  g.io.on('connection', async (socket: Socket) => {
    await sessionDir(event)
    event.context.socket = socket

    // import { readdir } from 'node:fs/promises'
    // readdir('.').then((files) => {
    //   for (const f of files) {
    //     socket.emit('file', f)
    //   }
    // })

    appSocket.emit = (channel, message) => {
      g.io.emit(channel, message)
    }

    socket.on('disconnect', () => {
      // Put optional disconnect logic here
    })

    inate(handlers)

    function inate(level: Handlers, prefix = '') {
      for (const k in level) {
        const v = level[k]

        if (typeof v === 'function') {
          addHandler(`${ prefix }${ k }`, v)
        } else {
          inate(v, `${ prefix }${ k }:`)
        }
      }
    }

    function addHandler(name: string, f: Handler) {
      // console.log('Registered', name)
      socket.on(name, async (...args: any[]) => {
        let cb: Function | undefined

        if (typeof args[args.length - 1] === 'function') {
          cb = args.pop()
        }

        const res = await f(event, ...args)

        if (cb) {
          cb(res)
        }
      })
    }
  })
})
