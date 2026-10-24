import { contextBridge, ipcRenderer } from 'electron'

/**
 * QuietBrowse — Preload Script
 *
 * This script runs in a sandboxed context and exposes
 * a safe, minimal API to the renderer process.
 *
 * The renderer CANNOT access Node.js or Electron APIs directly.
 * Everything goes through this bridge.
 */

contextBridge.exposeInMainWorld('quietBrowse', {
  // Window controls (for frameless window)
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  },

  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => process.platform
  },

  // IPC utilities
  on: (channel, callback) => {
    const validChannels = [
      'window:maximized-changed',
      'theme:changed'
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    }
  },

  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
})
