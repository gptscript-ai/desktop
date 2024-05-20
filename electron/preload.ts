// This is the preload script for Electron.
// It runs in the renderer process before the page is loaded.
// --------------------------------------------
import { ipcRenderer } from 'electron'

interface IPC {
  send:    (channel: string, data: any) => void
  receive: (channel: string, cb: (...args: any) => void) => void
}

declare global {
  interface Window {
    env: Record<string, string>
    ipc: IPC
  }
}

process.once('loaded', () => {
  console.info('Preload')

  window.env = process.env as Record<string, string>
  window.ipc = {
    send: (channel: string, data: any) => {
      ipcRenderer.send(channel, data)
    },
    receive: (channel: string, func: any) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    },
  }
})
