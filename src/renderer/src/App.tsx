import { useEffect, useRef, useCallback } from 'react'
import TitleBar from './components/TitleBar'
import NavigationBar from './components/NavigationBar'
import Welcome from './components/Welcome'
import { useTabs } from './hooks/useTabs'

export default function App() {
  const {
    activeTab,
    activeTabId,
    createTab,
    navigateActiveTab,
    hasActivePage
  } = useTabs()

  const contentRef = useRef<HTMLDivElement>(null)

  // Report the content area bounds to the main process
  // so it knows where to position the WebContentsView
  const reportBounds = useCallback(() => {
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      window.quietBrowse.tab.setBounds({
        x: Math.round(rect.x * dpr),
        y: Math.round(rect.y * dpr),
        width: Math.round(rect.width * dpr),
        height: Math.round(rect.height * dpr)
      })
    }
  }, [])

  // Report bounds on mount and on resize
  useEffect(() => {
    reportBounds()
    window.addEventListener('resize', reportBounds)
    return () => window.removeEventListener('resize', reportBounds)
  }, [reportBounds])

  // Also re-report when the tab bar visibility changes
  useEffect(() => {
    reportBounds()
  }, [hasActivePage, reportBounds])

  // Handle navigation from the omnibox
  const handleNavigate = useCallback(
    (input: string) => {
      if (activeTabId !== null) {
        navigateActiveTab(input)
      } else {
        // No active tab, create one
        createTab(input)
      }
    },
    [activeTabId, navigateActiveTab, createTab]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+T — new tab
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault()
        createTab()
      }
      // Ctrl+W — close active tab
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault()
        if (activeTabId !== null) {
          window.quietBrowse.tab.close(activeTabId)
        }
      }
      // Ctrl+L or F6 — focus address bar
      if ((e.ctrlKey && e.key === 'l') || e.key === 'F6') {
        e.preventDefault()
        const omnibox = document.querySelector<HTMLInputElement>('[aria-label="Address bar"]')
        omnibox?.focus()
      }
      // F5 — reload
      if (e.key === 'F5' && activeTabId !== null) {
        e.preventDefault()
        window.quietBrowse.tab.reload(activeTabId)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTabId, createTab])

  return (
    <div className="flex flex-col h-screen">
      <TitleBar />
      <NavigationBar
        activeTabId={activeTabId}
        currentUrl={activeTab?.url ?? ''}
        isLoading={activeTab?.isLoading ?? false}
        canGoBack={activeTab?.canGoBack ?? false}
        canGoForward={activeTab?.canGoForward ?? false}
        onNavigate={handleNavigate}
      />

      {/* Content area — WebContentsView is layered on top of this by the main process */}
      <div ref={contentRef} className="flex-1 relative overflow-hidden">
        {/* Welcome screen shows when no tabs are open */}
        {!hasActivePage && <Welcome onNavigate={handleNavigate} />}

        {/* When a tab is active, this div is overlaid by the WebContentsView.
            It's transparent — the real page is rendered by Chromium above. */}
        {hasActivePage && (
          <div className="absolute inset-0 bg-white" />
        )}
      </div>
    </div>
  )
}
