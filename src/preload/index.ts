import { contextBridge, ipcRenderer } from 'electron'

/**
 * QuietBrowse — Preload Script
 *
 * Exposes a safe, typed API to the renderer process.
 * All tab management and navigation goes through IPC.
 */

const api = {
  // ── Window Controls ────────────────────────────
  window: {
    minimize: (): void => ipcRenderer.send('window:minimize'),
    maximize: (): void => ipcRenderer.send('window:maximize'),
    close: (): void => ipcRenderer.send('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized')
  },

  // ── App Info ───────────────────────────────────
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
    getPlatform: (): string => process.platform
  },

  // ── Tab Management ─────────────────────────────
  tab: {
    create: (url?: string): Promise<number> => ipcRenderer.invoke('tab:create', url),
    activate: (tabId: number): void => ipcRenderer.send('tab:activate', tabId),
    close: (tabId: number): void => ipcRenderer.send('tab:close', tabId),
    navigate: (tabId: number, input: string): void => ipcRenderer.send('tab:navigate', tabId, input),
    back: (tabId: number): void => ipcRenderer.send('tab:back', tabId),
    forward: (tabId: number): void => ipcRenderer.send('tab:forward', tabId),
    reload: (tabId: number): void => ipcRenderer.send('tab:reload', tabId),
    stop: (tabId: number): void => ipcRenderer.send('tab:stop', tabId),
    getInfo: (tabId: number): Promise<unknown> => ipcRenderer.invoke('tab:getInfo', tabId),
    getAll: (): Promise<unknown[]> => ipcRenderer.invoke('tab:getAll'),
    getActive: (): Promise<number | null> => ipcRenderer.invoke('tab:getActive'),
    setBounds: (bounds: { x: number; y: number; width: number; height: number }): void =>
      ipcRenderer.send('tab:setBounds', bounds)
  },

  // ── Find in page ───────────────────────────────
  find: {
    start: (tabId: number, text: string, forward?: boolean): void =>
      ipcRenderer.send('find:start', tabId, text, forward),
    stop: (tabId: number): void => ipcRenderer.send('find:stop', tabId)
  },

  // ── Zoom ───────────────────────────────────────
  zoom: {
    set: (tabId: number, factor: number): void => ipcRenderer.send('zoom:set', tabId, factor),
    get: (tabId: number): Promise<number> => ipcRenderer.invoke('zoom:get', tabId)
  },

  // ── History ────────────────────────────────────
  history: {
    getAll: (): Promise<unknown[]> => ipcRenderer.invoke('history:getAll'),
    search: (query: string): Promise<unknown[]> => ipcRenderer.invoke('history:search', query),
    delete: (url: string): void => ipcRenderer.send('history:delete', url),
    clear: (): void => ipcRenderer.send('history:clear')
  },

  // ── Bookmarks ──────────────────────────────────
  bookmarks: {
    getAll: (folder?: string): Promise<unknown[]> => ipcRenderer.invoke('bookmarks:getAll', folder),
    add: (url: string, title: string, favicon?: string): void =>
      ipcRenderer.send('bookmarks:add', url, title, favicon),
    remove: (url: string): void => ipcRenderer.send('bookmarks:remove', url),
    isBookmarked: (url: string): Promise<boolean> => ipcRenderer.invoke('bookmarks:isBookmarked', url)
  },

  // ── Settings ───────────────────────────────────
  settings: {
    getAll: (): Promise<unknown> => ipcRenderer.invoke('settings:getAll'),
    get: (key: string): Promise<unknown> => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: unknown): void => ipcRenderer.send('settings:set', key, value)
  },

  // ── Event Listeners ────────────────────────────
  on: (channel: string, callback: (...args: unknown[]) => void): void => {
    const validChannels = [
      'window:maximized-changed',
      'theme:changed',
      'tab:updated',
      'tab:activated',
      'tab:closed',
      'tab:all-closed'
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    }
  },

  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel)
  }
} as const

export type QuietBrowseAPI = typeof api

contextBridge.exposeInMainWorld('quietBrowse', api)
