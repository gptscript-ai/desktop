// This is the dynamic renderer script for Electron.
// You can implement your custom renderer process configuration etc. here!
// --------------------------------------------

import * as path from 'node:path'
import { fork } from 'node:child_process'
import type { BrowserWindow } from 'electron'

// Dynamic Renderer
// ================
export default async function (mainWindow: BrowserWindow) {
  const p = path.resolve(process.cwd(), '.output', 'server', 'index.mjs')
  const f = fork(p, [])

  console.log('Forked')

  f.stdout?.on('data', (data) => {
    console.info(`stdout: ${ data }`)
  })

  f.stderr?.on('data', (data) => {
    console.error(`stderr: ${ data }`)
  })

  f.on('close', (code) => {
    console.info(`child process exited with code ${ code }`)
  })

  const port = 3000

  setTimeout(() => {
    console.log('Loading URL')
    mainWindow.loadURL(`http://localhost:${ port }`)
  }, 2000)
}
