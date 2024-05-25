import * as path from 'node:path'
import * as os from 'node:os'
import { Server, type Socket } from 'socket.io'
import { Client, type Client as ClientType } from '@gptscript-ai/gptscript'
import handlers, { type Handler, type Handlers } from '../handlers'

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

function gptscriptPath() {
  if (process.env.GPTSCRIPT_BIN) {
    return process.env.GPTSCRIPT_BIN
  }

  let exe = ''

  switch (os.platform()) {
    case 'darwin':
      exe = 'gptscript-universal-apple-darwin'
      break
    case 'win32':
      exe = 'gptscript-x86_64-pc-windows-msvc.exe'
      break
    default:
      exe = 'gptscript-x86_64-unknown-linux-gnu'
  }

  return path.resolve(path.dirname(''), 'binaries', exe)
}

export default defineEventHandler(async (event) => {
  const client = new Client(undefined, gptscriptPath())

  event.context.appSocket = appSocket
  event.context.gpt = client

  const g = globalThis as any

  if (g.io) {
    return
  }

  console.info('Starting socket middleware')

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
