import { contextBridge, ipcRenderer } from 'electron'

/**
 * QuietBrowse — Preload Script
 *
 * Exposes a safe, minimal API to the renderer process
 * through the context bridge. The renderer cannot access
 * Node.js or Electron APIs directly.
 */

const api = {
  window: {
    minimize: (): void => ipcRenderer.send('window:minimize'),
    maximize: (): void => ipcRenderer.send('window:maximize'),
    close: (): void => ipcRenderer.send('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized')
  },
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
    getPlatform: (): string => process.platform
  },
  on: (channel: string, callback: (...args: unknown[]) => void): void => {
    const validChannels = ['window:maximized-changed', 'theme:changed']
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
