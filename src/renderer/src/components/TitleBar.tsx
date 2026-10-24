export default function TitleBar() {
  const handleMinimize = () => window.quietBrowse.window.minimize()
  const handleMaximize = () => window.quietBrowse.window.maximize()
  const handleClose = () => window.quietBrowse.window.close()

  return (
    <header className="flex items-center justify-between h-[var(--spacing-titlebar)] bg-zinc-900/80 border-b border-white/[0.06] relative z-50 shrink-0">
      {/* Draggable area */}
      <div
        className="flex-1 flex items-center pl-4 h-full"
        style={{ WebkitAppRegion: 'drag', appRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-xs font-medium text-zinc-500 tracking-wider uppercase">
          QuietBrowse
        </span>
      </div>

      {/* Window controls */}
      <div
        className="flex h-full"
        style={{ WebkitAppRegion: 'no-drag', appRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="w-[46px] h-full flex items-center justify-center text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors duration-100"
          aria-label="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="5.5" width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="w-[46px] h-full flex items-center justify-center text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors duration-100"
          aria-label="Maximize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="w-[46px] h-full flex items-center justify-center text-zinc-500 hover:bg-red-500 hover:text-white transition-colors duration-100"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.2" />
            <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </header>
  )
}
