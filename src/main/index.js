import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

/**
 * QuietBrowse — Main Process
 *
 * This is the entry point for the Electron main process.
 * It creates the browser window and manages the app lifecycle.
 */

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: false
    }
  })

  // Show window when ready to prevent visual flash
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Notify renderer when maximized state changes
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximized-changed', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximized-changed', false)
  })

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// ── IPC Handlers ─────────────────────────────────
function setupIPC() {
  // Window controls
  ipcMain.on('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize()
    }
  })

  ipcMain.on('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('window:isMaximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  // App info
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })
}

// App lifecycle
app.whenReady().then(() => {
  // Set app user model id for Windows notifications and taskbar
  electronApp.setAppUserModelId('com.flame3301.quietbrowse')

  // Dev-mode: open DevTools with F12, ignore Ctrl+R in production
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed (Windows behavior)
app.on('window-all-closed', () => {
  app.quit()
})
