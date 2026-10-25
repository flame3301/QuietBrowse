import { useState, useRef, useEffect, useCallback } from 'react'

interface FindBarProps {
  activeTabId: number | null
  onClose: () => void
}

export default function FindBar({ activeTabId, onClose }: FindBarProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const doFind = useCallback(
    (forward = true) => {
      if (activeTabId !== null && query) {
        window.quietBrowse.find.start(activeTabId, query, forward)
      }
    },
    [activeTabId, query]
  )

  const handleClose = useCallback(() => {
    if (activeTabId !== null) {
      window.quietBrowse.find.stop(activeTabId)
    }
    onClose()
  }, [activeTabId, onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      doFind(!e.shiftKey) // Shift+Enter = find previous
    }
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  // Auto-search as user types
  useEffect(() => {
    if (query) doFind(true)
  }, [query, doFind])

  return (
    <div className="absolute top-0 right-4 z-30 flex items-center gap-1.5 h-9 px-3 bg-zinc-800 border border-white/[0.08] rounded-b-lg shadow-lg animate-fade-in-up">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find in page"
        spellCheck={false}
        className="w-48 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 outline-none"
        aria-label="Find in page"
      />

      {/* Previous */}
      <button
        onClick={() => doFind(false)}
        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
        aria-label="Previous match"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Next */}
      <button
        onClick={() => doFind(true)}
        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
        aria-label="Next match"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Close */}
      <button
        onClick={handleClose}
        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
        aria-label="Close find"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
