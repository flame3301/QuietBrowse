import { useEffect, useState } from 'react'

/**
 * TitleBar — frameless window title bar for Windows
 *
 * Features:
 * - Draggable region for window movement
 * - Native-sized window control buttons (min/max/close)
 * - Maximize icon switches to restore icon when maximized
 * - Double-click drag region to toggle maximize
 * - Close button goes red on hover (Windows convention)
 */
export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Check initial state
    window.quietBrowse.window.isMaximized().then(setIsMaximized)

    // Listen for changes
    window.quietBrowse.on('window:maximized-changed', (maximized: unknown) => {
      setIsMaximized(maximized as boolean)
    })
    return () => {
      window.quietBrowse.removeAllListeners('window:maximized-changed')
    }
  }, [])

  const handleMinimize = () => window.quietBrowse.window.minimize()
  const handleMaximize = () => window.quietBrowse.window.maximize()
  const handleClose = () => window.quietBrowse.window.close()

  return (
    <header
      className="flex items-center justify-between h-8 bg-zinc-900/90 backdrop-blur-sm border-b border-white/[0.04] relative z-50 shrink-0 select-none"
    >
      {/* Draggable title area — double click to maximize */}
      <div
        className="flex-1 flex items-center pl-3.5 h-full"
        style={{ WebkitAppRegion: 'drag', appRegion: 'drag' } as React.CSSProperties}
        onDoubleClick={handleMaximize}
      >
        <span className="text-[11px] font-semibold text-zinc-600 tracking-widest uppercase">
          QuietBrowse
        </span>
      </div>

      {/* Window controls — Windows 11 style sizing */}
      <div
        className="flex h-full"
        style={{ WebkitAppRegion: 'no-drag', appRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className="w-[46px] h-full flex items-center justify-center text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-300 transition-colors duration-75"
          aria-label="Minimize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="0" y="4.5" width="10" height="1" fill="currentColor" />
          </svg>
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          className="w-[46px] h-full flex items-center justify-center text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-300 transition-colors duration-75"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            /* Restore icon — two overlapping rectangles */
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="0" y="2" width="8" height="8" fill="var(--color-zinc-900, #18181b)" stroke="currentColor" strokeWidth="1" />
            </svg>
          ) : (
            /* Maximize icon — single rectangle */
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="w-[46px] h-full flex items-center justify-center text-zinc-500 hover:bg-[#e81123] hover:text-white transition-colors duration-75"
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2" />
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </header>
  )
}
