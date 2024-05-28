import * as path from 'node:path'
import * as os from 'node:os'

import { BrowserWindow, app } from 'electron'
import singleInstance from './singleInstance'
import dynamicRenderer from './dynamicRenderer'
import titleBarActionsModule from './modules/titleBarActions'
import updaterModule from './modules/updater'
import macMenuModule from './modules/macMenu'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
const isProduction = process.env.NODE_ENV !== 'development'
const platform: 'darwin' | 'win32' | 'linux' = process.platform as any
const arch = os.arch()
const headerSize = 32
const modules = [titleBarActionsModule, macMenuModule, updaterModule]

app.commandLine.appendSwitch('ignore-certificate-errors')

// Initialize app window
// =====================
function createWindow() {
  console.info('System info', { isProduction, platform, arch })
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width:           1280,
    height:          768,
    minWidth:        720,
    minHeight:       480,
    backgroundColor: '#000',
    webPreferences:  {
      devTools:         true, // !isProduction,
      nodeIntegration:  true,
      contextIsolation: false,
      preload:          path.join(__dirname, 'preload.js'),
    },

    titleBarStyle:   'default', // 'hiddenInset',
    // frame: platform === 'darwin',
    frame:           true, // <= Remove this line if you wanted to implement your own title bar
    titleBarOverlay: platform === 'darwin' && { height: headerSize },
    title:           'GPTStudio',
  })

  // Lock app to single instance
  if (singleInstance(app, mainWindow)) {
    return
  }

  // Open the DevTools.
  !isProduction && mainWindow.webContents.openDevTools()
  // mainWindow.webContents.openDevTools()

  return mainWindow
}

// App events
// ==========
app.whenReady().then(async () => {
  //  if (!isProduction) {
  //    try {
  //      await session.defaultSession.loadExtension(path.join(__dirname, '../..', '__extensions', 'vue-devtools'))
  //    } catch (err) {
  //      console.error('[Electron::loadExtensions] An error occurred: ', err)
  //    }
  //  }

  const mainWindow = createWindow()

  if (!mainWindow) {
    return
  }

  // Load renderer process
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    return mainWindow.loadURL('http://localhost:3000/')
  } else {
    dynamicRenderer(mainWindow)
  }

  // Initialize modules
  console.info(`${ '-'.repeat(30)  }\n[+] Loading modules...`)
  modules.forEach((module) => {
    try {
      module(mainWindow)
    } catch (err: any) {
      console.error('[!] Module error: ', err.message || err)
    }
  })

  console.info(`[!] Loading modules: Done.` + `\r\n${  '-'.repeat(30) }`)

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (BrowserWindow.getAllWindows().length === 0) createWindow()
    mainWindow.show()
  })

  //   ipcMain.on('doThing', (event, args) => {
  //     console.info('doingThing')
  //     mainWindow.webContents.send('didThing', 'stuff')
  //   })
  // })
  // ipc.receive('didThing', (data) => console.log(data))
  // ipc.send('doThing')

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
})
