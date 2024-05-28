import type { BrowserWindow, MenuItemConstructorOptions } from 'electron'
import { Menu, app } from 'electron'

// Helpers
// =======
const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = []

// Module
// ======
export default (mainWindow: BrowserWindow) => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (process.platform === 'darwin') {
    // OS X
    const name = 'GPTStudio'

    const submenu: MenuItemConstructorOptions[] = [
      {
        label: `About ${  name }`,
        role:  'about',
      },
      {
        label:       'Reload',
        accelerator: 'Command+R',
        click() {
          // Reload the current window
          if (mainWindow) {
            mainWindow.reload()
          }
        },
      },
      {
        label:       'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit()
        },
      },
    ]

    submenu.splice(1, 0, {
      label:       'Toggle Developer Tools',
      accelerator: 'Alt+Command+I',
      click() {
        // Open the DevTools.
        if (mainWindow) {
          mainWindow.webContents.toggleDevTools()
        }
      },
    })

    template.unshift({
      label: name,
      submenu,
    })

    const menu = Menu.buildFromTemplate(template)

    Menu.setApplicationMenu(menu)

    console.info('[-] MODULE::macMenu Initialized')
  }
}
