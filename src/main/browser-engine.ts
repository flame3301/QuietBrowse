import { WebContentsView, type BrowserWindow } from 'electron'

/**
 * BrowserEngine — manages WebContentsView instances (tabs)
 *
 * Each tab is a separate WebContentsView layered on the
 * main BrowserWindow. The React UI sits underneath; the
 * web content views float on top, positioned by layout info
 * from the renderer.
 */

export interface TabInfo {
  id: number
  url: string
  title: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  favicon: string
}

interface ManagedTab {
  view: WebContentsView
  id: number
}

export class BrowserEngine {
  private window: BrowserWindow
  private tabs: Map<number, ManagedTab> = new Map()
  private activeTabId: number | null = null
  private nextId = 1

  // Layout bounds for the web content area
  private contentBounds = { x: 0, y: 38, width: 800, height: 562 }

  constructor(window: BrowserWindow) {
    this.window = window
    this.updateBoundsOnResize()
  }

  /** Update content bounds when the window resizes */
  private updateBoundsOnResize(): void {
    this.window.on('resize', () => {
      this.updateActiveBounds()
    })
    this.window.on('maximize', () => {
      setTimeout(() => this.updateActiveBounds(), 50)
    })
    this.window.on('unmaximize', () => {
      setTimeout(() => this.updateActiveBounds(), 50)
    })
  }

  /** Set the content area layout from the renderer */
  setContentBounds(bounds: { x: number; y: number; width: number; height: number }): void {
    this.contentBounds = bounds
    this.updateActiveBounds()
  }

  /** Update the active tab's view bounds */
  private updateActiveBounds(): void {
    if (this.activeTabId === null) return
    const tab = this.tabs.get(this.activeTabId)
    if (!tab) return

    const [winWidth, winHeight] = this.window.getContentSize()
    tab.view.setBounds({
      x: this.contentBounds.x,
      y: this.contentBounds.y,
      width: Math.max(1, winWidth - this.contentBounds.x),
      height: Math.max(1, winHeight - this.contentBounds.y)
    })
  }

  /** Create a new tab and return its ID */
  createTab(url?: string): number {
    const id = this.nextId++
    const view = new WebContentsView({
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        webviewTag: false,
        spellcheck: true
      }
    })

    const managed: ManagedTab = { view, id }
    this.tabs.set(id, managed)

    // Wire up events to notify the renderer
    this.setupTabEvents(managed)

    // Add to window but hide initially
    this.window.contentView.addChildView(view)
    view.setBounds({ x: 0, y: 0, width: 0, height: 0 })

    // Navigate if URL provided
    if (url) {
      view.webContents.loadURL(url)
    }

    return id
  }

  /** Set up event listeners for a tab's WebContents */
  private setupTabEvents(tab: ManagedTab): void {
    const wc = tab.view.webContents

    const notify = (): void => {
      try {
        if (!this.window.isDestroyed()) {
          this.window.webContents.send('tab:updated', this.getTabInfo(tab.id))
        }
      } catch { /* window closing */ }
    }

    wc.on('did-start-loading', notify)
    wc.on('did-stop-loading', notify)
    wc.on('did-navigate', notify)
    wc.on('did-navigate-in-page', notify)
    wc.on('page-title-updated', notify)
    wc.on('page-favicon-updated', (_event, favicons) => {
      try {
        if (!this.window.isDestroyed()) {
          this.window.webContents.send('tab:updated', {
            ...this.getTabInfo(tab.id),
            favicon: favicons[0] || ''
          })
        }
      } catch { /* window closing */ }
    })

    // Handle new-window requests (open in same tab or new tab)
    wc.setWindowOpenHandler(({ url }) => {
      this.navigate(tab.id, url)
      return { action: 'deny' }
    })
  }

  /** Get info about a specific tab */
  getTabInfo(tabId: number): TabInfo | null {
    const tab = this.tabs.get(tabId)
    if (!tab) return null

    const wc = tab.view.webContents
    return {
      id: tab.id,
      url: wc.getURL(),
      title: wc.getTitle() || 'New Tab',
      isLoading: wc.isLoading(),
      canGoBack: wc.navigationHistory.canGoBack(),
      canGoForward: wc.navigationHistory.canGoForward(),
      favicon: ''
    }
  }

  /** Get info about all tabs */
  getAllTabs(): TabInfo[] {
    const tabs: TabInfo[] = []
    for (const [id] of this.tabs) {
      const info = this.getTabInfo(id)
      if (info) tabs.push(info)
    }
    return tabs
  }

  /** Switch to a tab */
  activateTab(tabId: number): void {
    // Hide current active tab
    if (this.activeTabId !== null) {
      const current = this.tabs.get(this.activeTabId)
      if (current) {
        current.view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
      }
    }

    this.activeTabId = tabId
    this.updateActiveBounds()

    // Notify renderer
    this.window.webContents.send('tab:activated', tabId)
    const info = this.getTabInfo(tabId)
    if (info) {
      this.window.webContents.send('tab:updated', info)
    }
  }

  /** Navigate a tab to a URL */
  navigate(tabId: number, url: string): void {
    const tab = this.tabs.get(tabId)
    if (!tab) return
    tab.view.webContents.loadURL(url)
  }

  /** Go back in a tab */
  goBack(tabId: number): void {
    this.tabs.get(tabId)?.view.webContents.navigationHistory.goBack()
  }

  /** Go forward in a tab */
  goForward(tabId: number): void {
    this.tabs.get(tabId)?.view.webContents.navigationHistory.goForward()
  }

  /** Reload a tab */
  reload(tabId: number): void {
    this.tabs.get(tabId)?.view.webContents.reload()
  }

  /** Stop loading a tab */
  stopLoading(tabId: number): void {
    this.tabs.get(tabId)?.view.webContents.stop()
  }

  /** Close a tab */
  closeTab(tabId: number): void {
    const tab = this.tabs.get(tabId)
    if (!tab) return

    // Remove from map first to prevent re-entry
    this.tabs.delete(tabId)

    // Safely remove from window and destroy
    try {
      this.window.contentView.removeChildView(tab.view)
    } catch {
      // View may already be removed during window teardown
    }

    try {
      if (!tab.view.webContents.isDestroyed()) {
        tab.view.webContents.close()
      }
    } catch {
      // WebContents may already be destroyed
    }

    // If this was the active tab, activate another
    if (this.activeTabId === tabId) {
      this.activeTabId = null
      const remaining = Array.from(this.tabs.keys())
      if (remaining.length > 0) {
        this.activateTab(remaining[remaining.length - 1])
      } else {
        try {
          if (!this.window.isDestroyed()) {
            this.window.webContents.send('tab:all-closed')
          }
        } catch { /* window closing */ }
      }
    }

    try {
      if (!this.window.isDestroyed()) {
        this.window.webContents.send('tab:closed', tabId)
      }
    } catch { /* window closing */ }
  }

  /** Get the active tab ID */
  getActiveTabId(): number | null {
    return this.activeTabId
  }

  /** Get the count of open tabs */
  getTabCount(): number {
    return this.tabs.size
  }

  /** Destroy all tabs — called during app shutdown */
  destroy(): void {
    // Collect IDs first to avoid mutating map during iteration
    const ids = Array.from(this.tabs.keys())
    for (const id of ids) {
      this.closeTab(id)
    }
  }
}

