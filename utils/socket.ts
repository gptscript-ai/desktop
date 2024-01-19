// Portions Copyright (c) 2014-2021 Rancher Labs, Inc. https://github.com/rancher/dashboard

import Emitter from 'pico-emitter'
import { isSafari } from '@/utils/platform'
import { addParam } from '@/utils/url'

declare global {
  interface WebSocket {
    sockId: number
    metadata: object
  }

  interface Message {
    detail?: any
  }

  interface WebSocketOptions {
    autoReconnect?: boolean
    evenInitially?: boolean
    frameTimeout?: number
    protocol?: string
    addSockId?: boolean
  }
}

let sockId = 1
let warningShown = false
let wasConnected = false

const INSECURE_WS = 'ws://'
const SECURE_WS = 'wss://'

export const EVENT_CONNECTING = 'connecting'
export const EVENT_CONNECTED = 'connected'
export const EVENT_DISCONNECTED = 'disconnected'
export const EVENT_MESSAGE = 'message'
export const EVENT_FRAME_TIMEOUT = 'frame_timeout'
export const EVENT_CONNECT_ERROR = 'connect_error'
export const EVENT_RECONNECTING = 'reconnecting'

const STATE_DISCONNECTED = 'disconnected'
const STATE_CONNECTING = 'connecting'
const STATE_CONNECTED = 'connected'
const STATE_CLOSING = 'closing'
const STATE_RECONNECTING = 'reconnecting'

export default class Socket {
  hasBeenOpen = false
  hasReconnected = false
  framesReceived = 0
  tries = 0

  private emitter: Emitter
  private url = ''
  private autoReconnect = true
  private evenInitially = false
  private frameTimeout = 32000
  private metadata: object = {}
  private protocol: string | null = null
  private addSockId = true

  private socket: WebSocket | null = null
  private state: string = STATE_DISCONNECTED
  private frameTimer: any
  private reconnectTimer: any
  private disconnectCbs: Array<() => any> = []
  private disconnectedAt = 0
  private closingId = 0

  constructor(url: string, opt: WebSocketOptions = {}) {
    this.emitter = new Emitter()

    this.setUrl(url)
    this.autoReconnect = opt.autoReconnect !== false
    this.evenInitially = opt.evenInitially === true
    this.protocol = opt.protocol || null
    this.addSockId = opt.addSockId !== false

    if (typeof opt.frameTimeout !== 'undefined' ) {
      this.frameTimeout = opt.frameTimeout
    }
  }

  on(event: string, callback: (e?: any) => any) {
    this.emitter.on(event, callback)

    if ( event === EVENT_CONNECTED && this.state === STATE_CONNECTED ) {
      callback()
    }
  }

  once(event: string, callback: (e?: any) => any) {
    this.emitter.once(event, callback)
  }

  off(event: string, callback: () => any) {
    this.emitter.off(event, callback)
  }

  emit(event: string, ...data: any) {
    this.emitter.emit(event, ...data)
  }

  setUrl(url: string) {
    if ( url.startsWith('/') ) {
      url = window.location.origin.replace(/^http/, 'ws') + url
    }

    if ( url.startsWith('http') ) {
      url = url.replace(/^http/, 'ws')
    }

    if (window.location.protocol === 'https:' && url.startsWith(INSECURE_WS)) {
      url = SECURE_WS + url.substring(INSECURE_WS.length)
    }

    this.url = url
  }

  connect(metadata: object = {}) {
    if (this.socket) {
      // console.error('Socket refusing to connect while another socket exists')
      return
    }

    Object.assign(this.metadata, metadata)

    const id = sockId++
    let url = this.url

    if ( this.addSockId ) {
      url = addParam(url, 'sockId', `${ id }`)
    }

    console.info(`Socket connecting (id=${ id }, url=${ `${ url.replace(/\?.*/, '') }...` })`)

    let socket: WebSocket

    if (this.protocol) {
      socket = new WebSocket(url, this.protocol)
    } else {
      socket = new WebSocket(url)
    }

    socket.sockId = id
    socket.metadata = this.metadata
    socket.onmessage = this.onmessage.bind(this)
    socket.onopen = this.opened.bind(this)
    socket.onerror = this.error.bind(this)
    socket.onclose = this.closed.bind(this)

    this.socket = socket
    this.state = STATE_CONNECTING

    this.emitter.emit(EVENT_CONNECTING)
  }

  send(data: any) {
    if (this.socket && this.state === STATE_CONNECTED) {
      if ( data && typeof data === 'object' ) {
        this.socket.send(JSON.stringify(data))
      } else {
        this.socket.send(data)
      }

      return true
    }

    return false
  }

  disconnect(cb?: () => any): Promise<true> {
    if (cb) {
      this.disconnectCbs.push(cb)
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    const promise = new Promise((resolve, reject) => {
      if (this.state === STATE_DISCONNECTED) {
        resolve(true)
      }

      function onError() {
        reject(new Error('Connect Error'))
        self.emitter.off(EVENT_CONNECT_ERROR, onError)
      }

      this.on(EVENT_CONNECT_ERROR, onError)

      this.disconnectCbs.push(() => {
        this.off(EVENT_CONNECT_ERROR, onError)
        resolve(true)
      })
    })

    this.autoReconnect = false
    this.close()

    return promise as Promise<true>
  }

  reconnect(metadata: object) {
    Object.assign(this.metadata, metadata)

    if (this.state === STATE_CONNECTING) {
      this.log('Ignoring reconnect for socket in connecting')

      return
    }

    if (this.socket) {
      this.close()
    } else {
      this.connect(metadata)
    }
  }

  getMetadata(): object {
    if (this.socket) {
      return this.socket.metadata
    } else {
      return {}
    }
  }

  getId(): number {
    if (this.socket) {
      return this.socket.sockId
    } else {
      return 0
    }
  }

  setAutoReconnect(autoReconnect: boolean) {
    this.autoReconnect = autoReconnect
  }

  protected close() {
    const socket = this.socket

    if (!socket) {
      return
    }

    try {
      this.log('Closing Socket')
      this.closingId = socket.sockId
      socket.onopen = null
      socket.onerror = null
      socket.onmessage = null
      socket.close()
    } catch (e) {
      this.log('Socket exception', e)
      // Continue anyway...
    }

    this.state = STATE_CLOSING
  }

  protected opened() {
    this.log('opened')
    const now = (new Date()).getTime()

    const at = this.disconnectedAt
    let after: number = 0

    if (at) {
      after = now - at
    }

    if (this.hasBeenOpen) {
      this.hasReconnected = true
    }

    this.hasBeenOpen = true
    this.state = STATE_CONNECTED
    this.framesReceived = 0
    this.disconnectedAt = 0

    this.emitter.emit(EVENT_CONNECTED, <Message>{ detail: { tries: this.tries, after } })
    this.resetWatchdog()
    clearTimeout(this.reconnectTimer)
  }

  protected onmessage(event: object) {
    this.resetWatchdog()
    this.tries = 0
    this.framesReceived++

    this.emitter.emit(EVENT_MESSAGE, <Message>{ detail: event })
  }

  protected resetWatchdog() {
    clearTimeout(this.frameTimer)

    const timeout = this.frameTimeout

    if (timeout && this.state === STATE_CONNECTED) {
      this.frameTimer = setTimeout(() => {
        this.log('Socket watchdog expired after', timeout, 'closing')
        this.close()
        this.emitter.emit(EVENT_FRAME_TIMEOUT)
      }, timeout)
    }
  }

  protected error() {
    this.closingId = (this.socket ? this.socket.sockId : 0)
    this.log('error')
  }

  protected closed() {
    console.info(`Socket ${ this.closingId } closed`)

    this.closingId = 0
    this.socket = null
    clearTimeout(this.reconnectTimer)
    clearTimeout(this.frameTimer)

    const cbs = this.disconnectCbs

    while (cbs.length) {
      const fn = cbs.pop()

      if (fn) {
        fn.apply(this)
      }
    }

    if ([STATE_CONNECTED, STATE_CLOSING].includes(this.state)) {
      wasConnected = true
    }

    if (!this.disconnectedAt) {
      this.disconnectedAt = (new Date()).getTime()
    }

    if (!warningShown && !wasConnected && !this.evenInitially) {
      this.autoReconnect = false
      this.state = STATE_DISCONNECTED

      this.emitter.emit(EVENT_CONNECT_ERROR, <Message>{ detail: { isSafari } })
      warningShown = true
    } else if (this.autoReconnect) {
      this.state = STATE_RECONNECTING
      this.emitter.emit(EVENT_RECONNECTING)
      this.tries++
      const delay = Math.max(1000, Math.min(1000 * this.tries, 30000))

      this.reconnectTimer = setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      this.state = STATE_DISCONNECTED
    }

    if (this.state === STATE_DISCONNECTED) {
      this.emitter.emit(EVENT_DISCONNECTED)
    } else if (this.state === STATE_RECONNECTING) {
      this.emitter.emit(EVENT_CONNECTING)
    }
  }

  protected log(...args: any[]) {
    args.unshift('Socket')
    args.push(`(state=${ this.state }, id=${ this.socket ? this.socket.sockId : 0 })`)

    console.info(args.join(' '))
  }
}
