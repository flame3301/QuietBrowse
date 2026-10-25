import { useEffect, useRef, useCallback, useState } from 'react'
import TitleBar from './components/TitleBar'
import NavigationBar from './components/NavigationBar'
import TabBar from './components/TabBar'
import FindBar from './components/FindBar'
import Welcome from './components/Welcome'
import SettingsPanel from './components/SettingsPanel'
import { useTabs } from './hooks/useTabs'

export default function App() {
  const {
    tabs,
    activeTab,
    activeTabId,
    createTab,
    navigateActiveTab,
    closeTab,
    activateTab,
    hasActivePage
  } = useTabs()

  const contentRef = useRef<HTMLDivElement>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [findOpen, setFindOpen] = useState(false)

  // Report the content area bounds to the main process
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

  useEffect(() => {
    reportBounds()
    window.addEventListener('resize', reportBounds)
    return () => window.removeEventListener('resize', reportBounds)
  }, [reportBounds])

  // Re-report when tab state changes (tab bar visibility)
  useEffect(() => {
    // Small delay to let the DOM update
    const timer = setTimeout(reportBounds, 50)
    return () => clearTimeout(timer)
  }, [hasActivePage, tabs.length, reportBounds])

  const handleNavigate = useCallback(
    (input: string) => {
      if (activeTabId !== null) {
        navigateActiveTab(input)
      } else {
        createTab(input)
      }
    },
    [activeTabId, navigateActiveTab, createTab]
  )

  const handleNewTab = useCallback(() => {
    createTab()
  }, [createTab])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault()
        createTab()
      }
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault()
        if (activeTabId !== null) closeTab(activeTabId)
      }
      if ((e.ctrlKey && e.key === 'l') || e.key === 'F6') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('[aria-label="Address bar"]')?.focus()
      }
      if (e.key === 'F5' && activeTabId !== null) {
        e.preventDefault()
        window.quietBrowse.tab.reload(activeTabId)
      }
      // Ctrl+Tab — next tab
      if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        if (tabs.length > 1 && activeTabId !== null) {
          const idx = tabs.findIndex((t) => t.id === activeTabId)
          const nextIdx = (idx + 1) % tabs.length
          activateTab(tabs[nextIdx].id)
        }
      }
      // Ctrl+Shift+Tab — previous tab
      if (e.ctrlKey && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        if (tabs.length > 1 && activeTabId !== null) {
          const idx = tabs.findIndex((t) => t.id === activeTabId)
          const prevIdx = (idx - 1 + tabs.length) % tabs.length
          activateTab(tabs[prevIdx].id)
        }
      }
      // Ctrl+, — settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault()
        setSettingsOpen((prev) => !prev)
      }
      // Ctrl+F — find in page
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        if (activeTabId !== null) setFindOpen(true)
      }
      // Ctrl+= or Ctrl++ — zoom in
      if (e.ctrlKey && (e.key === '=' || e.key === '+') && activeTabId !== null) {
        e.preventDefault()
        window.quietBrowse.zoom.get(activeTabId).then((z: number) => {
          window.quietBrowse.zoom.set(activeTabId, Math.min(3, z + 0.1))
        })
      }
      // Ctrl+- — zoom out
      if (e.ctrlKey && e.key === '-' && activeTabId !== null) {
        e.preventDefault()
        window.quietBrowse.zoom.get(activeTabId).then((z: number) => {
          window.quietBrowse.zoom.set(activeTabId, Math.max(0.3, z - 0.1))
        })
      }
      // Ctrl+0 — reset zoom
      if (e.ctrlKey && e.key === '0' && activeTabId !== null) {
        e.preventDefault()
        window.quietBrowse.zoom.set(activeTabId, 1.0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTabId, tabs, createTab, closeTab, activateTab])

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
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Vertical tab bar — only show when tabs exist */}
        {tabs.length > 0 && (
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onActivate={activateTab}
            onClose={closeTab}
            onNewTab={handleNewTab}
          />
        )}

        {/* Content area — WebContentsView overlays this */}
        <div ref={contentRef} className="flex-1 relative overflow-hidden">
          {!hasActivePage && <Welcome onNavigate={handleNavigate} />}
          {hasActivePage && <div className="absolute inset-0 bg-white" />}

          {/* Find bar — floats over content */}
          {findOpen && hasActivePage && (
            <FindBar activeTabId={activeTabId} onClose={() => setFindOpen(false)} />
          )}
        </div>
      </div>

      {/* Settings panel overlay */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
