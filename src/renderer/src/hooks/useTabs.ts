import { useState, useEffect, useCallback, useRef } from 'react'

export interface TabInfo {
  id: number
  url: string
  title: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  favicon: string
}

export function useTabs() {
  const [tabs, setTabs] = useState<TabInfo[]>([])
  const [activeTabId, setActiveTabId] = useState<number | null>(null)
  const boundsReported = useRef(false)

  // Listen for tab events from the main process
  useEffect(() => {
    const handleUpdated = (info: TabInfo) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === info.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = info
          return next
        }
        return [...prev, info]
      })
    }

    const handleActivated = (tabId: number) => {
      setActiveTabId(tabId)
    }

    const handleClosed = (tabId: number) => {
      setTabs((prev) => prev.filter((t) => t.id !== tabId))
    }

    const handleAllClosed = () => {
      setTabs([])
      setActiveTabId(null)
    }

    window.quietBrowse.on('tab:updated', handleUpdated as (...args: unknown[]) => void)
    window.quietBrowse.on('tab:activated', handleActivated as (...args: unknown[]) => void)
    window.quietBrowse.on('tab:closed', handleClosed as (...args: unknown[]) => void)
    window.quietBrowse.on('tab:all-closed', handleAllClosed)

    return () => {
      window.quietBrowse.removeAllListeners('tab:updated')
      window.quietBrowse.removeAllListeners('tab:activated')
      window.quietBrowse.removeAllListeners('tab:closed')
      window.quietBrowse.removeAllListeners('tab:all-closed')
    }
  }, [])

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null

  const createTab = useCallback(async (url?: string) => {
    const id = await window.quietBrowse.tab.create(url)
    return id
  }, [])

  const navigateActiveTab = useCallback(
    (input: string) => {
      if (activeTabId !== null) {
        window.quietBrowse.tab.navigate(activeTabId, input)
      }
    },
    [activeTabId]
  )

  const closeTab = useCallback((tabId: number) => {
    window.quietBrowse.tab.close(tabId)
  }, [])

  const activateTab = useCallback((tabId: number) => {
    window.quietBrowse.tab.activate(tabId)
  }, [])

  /** Report the content area bounds to the main process */
  const reportBounds = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    window.quietBrowse.tab.setBounds(bounds)
    boundsReported.current = true
  }, [])

  return {
    tabs,
    activeTab,
    activeTabId,
    createTab,
    navigateActiveTab,
    closeTab,
    activateTab,
    reportBounds,
    hasActivePage: activeTabId !== null && tabs.length > 0
  }
}
