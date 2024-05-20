import type { Socket } from 'socket.io-client'
import io from 'socket.io-client'

export default function useSocket() {
  // const app = useNuxtApp()
  const socket: Socket = io(`${ location.protocol === 'https:' ? 'wss://' : 'ws://' }${ location.host }`)

  console.info('Creating Socket')

  socket.on('connect', () => {
    console.info('Socket Connected', socket.id)
  })

  socket.io.on('error', (err) => {
    console.error('Socket Error', err)
  })

  socket.io.on('ping', () => {
    console.debug('Socket Ping')
  })

  socket.io.on('reconnect', (tries) => {
    const msg = ['Socket Reconnected']

    if (tries > 1) {
      msg.push(`after ${ tries } tries`)
    }

    console.info(...msg)
  })

  socket.io.on('reconnect_attempt', (tries) => {
    const msg = ['Socket Reconnecting']

    if (tries > 1) {
      msg.push(`(attempt #${ tries })`)
    }

    console.info(...msg)
  })

  socket.io.on('reconnect_error', (err) => {
    // eslint-disable-next-line no-console
    console.warn('Reconnect Error', err)
  })

  socket.io.on('reconnect_failed', () => {
    console.error('Reconnect Failed')
  })

  return socket
}
