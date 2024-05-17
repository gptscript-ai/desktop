// This is the preload script for Electron.
// It runs in the renderer process before the page is loaded.
// --------------------------------------------
import { contextBridge, ipcRenderer } from 'electron'

process.once('loaded', () => {
  console.info('Preload')

  // // Exposed variables will be accessible at "window.versions".
  // contextBridge.exposeInMainWorld('versions', process.env)

  // contextBridge.exposeInMainWorld('api', {
  //   send: (channel: string, data: any) => {
  //     ipcRenderer.send(channel, data)
  //   },
  //   receive: (channel: string, func: any) => {
  //     ipcRenderer.on(channel, (event, ...args) => func(...args))
  //   },
  // })
})
