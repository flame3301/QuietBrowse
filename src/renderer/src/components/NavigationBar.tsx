import Omnibox from './Omnibox'

interface NavigationBarProps {
  activeTabId: number | null
  currentUrl: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  onNavigate: (input: string) => void
  onOpenSettings: () => void
}

export default function NavigationBar({
  activeTabId,
  currentUrl,
  isLoading,
  canGoBack,
  canGoForward,
  onNavigate,
  onOpenSettings
}: NavigationBarProps) {
  const handleBack = () => {
    if (activeTabId !== null) window.quietBrowse.tab.back(activeTabId)
  }
  const handleForward = () => {
    if (activeTabId !== null) window.quietBrowse.tab.forward(activeTabId)
  }
  const handleReload = () => {
    if (activeTabId !== null) window.quietBrowse.tab.reload(activeTabId)
  }
  const handleStop = () => {
    if (activeTabId !== null) window.quietBrowse.tab.stop(activeTabId)
  }

  return (
    <div className="flex items-center gap-1.5 h-10 px-2 bg-zinc-900/60 border-b border-white/[0.04] shrink-0">
      {/* Back */}
      <NavButton
        onClick={handleBack}
        disabled={!canGoBack}
        label="Back"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </NavButton>

      {/* Forward */}
      <NavButton
        onClick={handleForward}
        disabled={!canGoForward}
        label="Forward"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </NavButton>

      {/* Reload / Stop */}
      <NavButton
        onClick={isLoading ? handleStop : handleReload}
        label={isLoading ? 'Stop' : 'Reload'}
      >
        {isLoading ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 2.5L10.5 2.5L8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </NavButton>

      {/* Omnibox */}
      <Omnibox
        currentUrl={currentUrl}
        isLoading={isLoading}
        onNavigate={onNavigate}
        onStop={handleStop}
      />

      {/* New tab button */}
      <NavButton
        onClick={() => window.quietBrowse.tab.create()}
        label="New tab"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </NavButton>

      {/* Settings button */}
      <NavButton
        onClick={onOpenSettings}
        label="Settings"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </NavButton>
    </div>
  )
}

function NavButton({
  onClick,
  disabled = false,
  label,
  children
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        w-8 h-8 flex items-center justify-center rounded-md
        transition-colors duration-100
        ${disabled
          ? 'text-zinc-700 cursor-not-allowed'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] active:bg-white/[0.1]'
        }
      `}
    >
      {children}
    </button>
  )
}
