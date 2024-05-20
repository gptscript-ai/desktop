import type { BrowserWindow } from 'electron'
import { contextBridge, ipcRenderer } from 'electron'

export default (mainWindow: BrowserWindow) => {
  console.info('[-] MODULE::clickyServes Initializing')

  console.info('[-] MODULE::clickyServes Initialized')
}
