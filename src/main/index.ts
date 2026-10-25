import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { BrowserEngine, type TabInfo } from './browser-engine'
import { inputToURL, setSearchEngine } from './url-utils'
import { storage, type HistoryEntry, type Bookmark, type AppSettings } from './storage'

/**
 * QuietBrowse — Main Process
 *
 * Entry point for the Electron main process.
 * Creates the browser window, manages the browser engine,
 * and handles all IPC communication with the renderer.
 */

let engine: BrowserEngine | null = null

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#09090b',
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximized-changed', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximized-changed', false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Initialize the browser engine
  engine = new BrowserEngine(mainWindow)

  return mainWindow
}

// ── IPC Handlers ─────────────────────────────────
function setupIPC(): void {
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

  // ── Tab / Navigation IPC ─────────────────────────
  ipcMain.handle('tab:create', (_event, url?: string): number => {
    if (!engine) return -1
    const resolvedUrl = url ? inputToURL(url) : undefined
    const id = engine.createTab(resolvedUrl)
    engine.activateTab(id)
    return id
  })

  ipcMain.on('tab:activate', (_event, tabId: number) => {
    engine?.activateTab(tabId)
  })

  ipcMain.on('tab:close', (_event, tabId: number) => {
    engine?.closeTab(tabId)
  })

  ipcMain.on('tab:navigate', (_event, tabId: number, input: string) => {
    if (!engine) return
    const url = inputToURL(input)
    if (url) engine.navigate(tabId, url)
  })

  ipcMain.on('tab:back', (_event, tabId: number) => {
    engine?.goBack(tabId)
  })

  ipcMain.on('tab:forward', (_event, tabId: number) => {
    engine?.goForward(tabId)
  })

  ipcMain.on('tab:reload', (_event, tabId: number) => {
    engine?.reload(tabId)
  })

  ipcMain.on('tab:stop', (_event, tabId: number) => {
    engine?.stopLoading(tabId)
  })

  ipcMain.handle('tab:getInfo', (_event, tabId: number): TabInfo | null => {
    return engine?.getTabInfo(tabId) ?? null
  })

  ipcMain.handle('tab:getAll', (): TabInfo[] => {
    return engine?.getAllTabs() ?? []
  })

  ipcMain.handle('tab:getActive', (): number | null => {
    return engine?.getActiveTabId() ?? null
  })

  ipcMain.on('tab:setBounds', (_event, bounds: { x: number; y: number; width: number; height: number }) => {
    engine?.setContentBounds(bounds)
  })

  // ── Find in page IPC ───────────────────────────
  ipcMain.on('find:start', (_event, tabId: number, text: string, forward?: boolean) => {
    engine?.findInPage(tabId, text, forward)
  })

  ipcMain.on('find:stop', (_event, tabId: number) => {
    engine?.stopFindInPage(tabId)
  })

  // ── Zoom IPC ───────────────────────────────────
  ipcMain.on('zoom:set', (_event, tabId: number, factor: number) => {
    engine?.setZoom(tabId, factor)
  })

  ipcMain.handle('zoom:get', (_event, tabId: number): number => {
    return engine?.getZoom(tabId) ?? 1.0
  })

  // ── History IPC ──────────────────────────────────
  ipcMain.handle('history:getAll', (): HistoryEntry[] => {
    return storage.getHistory()
  })

  ipcMain.handle('history:search', (_event, query: string): HistoryEntry[] => {
    return storage.searchHistory(query)
  })

  ipcMain.on('history:delete', (_event, url: string) => {
    storage.deleteHistoryEntry(url)
  })

  ipcMain.on('history:clear', () => {
    storage.clearHistory()
  })

  // ── Bookmarks IPC ────────────────────────────────
  ipcMain.handle('bookmarks:getAll', (_event, folder?: string): Bookmark[] => {
    return storage.getBookmarks(folder)
  })

  ipcMain.on('bookmarks:add', (_event, url: string, title: string, favicon?: string) => {
    storage.addBookmark(url, title, favicon)
  })

  ipcMain.on('bookmarks:remove', (_event, url: string) => {
    storage.removeBookmark(url)
  })

  ipcMain.handle('bookmarks:isBookmarked', (_event, url: string): boolean => {
    return storage.isBookmarked(url)
  })

  // ── Settings IPC ─────────────────────────────────
  ipcMain.handle('settings:getAll', (): AppSettings => {
    return storage.getAllSettings()
  })

  ipcMain.handle('settings:get', (_event, key: string): unknown => {
    return storage.getSetting(key as keyof AppSettings)
  })

  ipcMain.on('settings:set', (_event, key: string, value: unknown) => {
    storage.setSetting(key as keyof AppSettings, value as AppSettings[keyof AppSettings])
    // Apply search engine change immediately
    if (key === 'searchEngine') {
      setSearchEngine(value as string)
    }
  })
}

// ── App Lifecycle ────────────────────────────────
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.flame3301.quietbrowse')

  // Initialize storage before anything else
  storage.init()

  // Apply saved search engine preference
  setSearchEngine(storage.getSetting('searchEngine'))

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

app.on('window-all-closed', () => {
  engine?.destroy()
  app.quit()
})
