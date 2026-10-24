import { useState, useCallback } from 'react'
import type { TabInfo } from '../hooks/useTabs'

interface TabBarProps {
  tabs: TabInfo[]
  activeTabId: number | null
  onActivate: (tabId: number) => void
  onClose: (tabId: number) => void
  onNewTab: () => void
}

export default function TabBar({ tabs, activeTabId, onActivate, onClose, onNewTab }: TabBarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`
        flex flex-col shrink-0 bg-zinc-900/40 border-r border-white/[0.04]
        transition-all duration-200 ease-out
        ${collapsed ? 'w-12' : 'w-60'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-9 px-2 shrink-0">
        {!collapsed && (
          <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider pl-1.5">
            Tabs
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.06] transition-colors ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            {collapsed ? (
              <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Tab list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 space-y-0.5">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            collapsed={collapsed}
            onActivate={onActivate}
            onClose={onClose}
          />
        ))}
      </div>

      {/* New tab button */}
      <div className="p-1.5 shrink-0">
        <button
          onClick={onNewTab}
          className={`
            flex items-center gap-2 w-full rounded-lg px-2.5 h-8
            text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]
            transition-colors duration-100
            ${collapsed ? 'justify-center px-0' : ''}
          `}
          aria-label="New tab"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {!collapsed && <span className="text-xs">New Tab</span>}
        </button>
      </div>
    </aside>
  )
}

function TabItem({
  tab,
  isActive,
  collapsed,
  onActivate,
  onClose
}: {
  tab: TabInfo
  isActive: boolean
  collapsed: boolean
  onActivate: (tabId: number) => void
  onClose: (tabId: number) => void
}) {
  const [hovered, setHovered] = useState(false)

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onClose(tab.id)
    },
    [tab.id, onClose]
  )

  const displayTitle = tab.title || 'New Tab'
  const displayUrl = cleanDomain(tab.url)

  return (
    <button
      onClick={() => onActivate(tab.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group flex items-center gap-2 w-full rounded-lg text-left
        transition-colors duration-100 relative
        ${collapsed ? 'h-9 justify-center px-0' : 'h-9 px-2.5'}
        ${isActive
          ? 'bg-accent-500/10 text-zinc-200'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'
        }
      `}
      aria-label={displayTitle}
      title={collapsed ? displayTitle : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent-500 rounded-full" />
      )}

      {/* Favicon */}
      <div className="w-4 h-4 shrink-0 flex items-center justify-center">
        {tab.isLoading ? (
          <div className="w-3 h-3 border-[1.5px] border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
        ) : tab.favicon ? (
          <img src={tab.favicon} alt="" className="w-4 h-4 rounded-sm" />
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-600">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />
            <path d="M7 1.5C7 1.5 4 4 4 7s3 5.5 3 5.5" stroke="currentColor" strokeWidth="1" />
            <path d="M7 1.5C7 1.5 10 4 10 7s-3 5.5-3 5.5" stroke="currentColor" strokeWidth="1" />
            <line x1="1.5" y1="7" x2="12.5" y2="7" stroke="currentColor" strokeWidth="1" />
          </svg>
        )}
      </div>

      {/* Title and URL */}
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <div className="text-xs truncate leading-tight">{displayTitle}</div>
          {displayUrl && (
            <div className="text-[10px] text-zinc-600 truncate leading-tight">{displayUrl}</div>
          )}
        </div>
      )}

      {/* Close button */}
      {!collapsed && hovered && (
        <button
          onClick={handleClose}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.1] transition-colors"
          aria-label={`Close ${displayTitle}`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </button>
  )
}

function cleanDomain(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
