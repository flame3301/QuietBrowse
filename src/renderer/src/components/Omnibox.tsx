import { useState, useRef, useEffect, useCallback } from 'react'

interface OmniboxProps {
  currentUrl: string
  isLoading: boolean
  onNavigate: (input: string) => void
  onStop: () => void
}

export default function Omnibox({ currentUrl, isLoading, onNavigate, onStop }: OmniboxProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync displayed URL when navigation completes (only when not focused)
  useEffect(() => {
    if (!isFocused && currentUrl) {
      setValue(cleanUrlForDisplay(currentUrl))
    }
  }, [currentUrl, isFocused])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed) {
        onNavigate(trimmed)
        inputRef.current?.blur()
      }
    },
    [value, onNavigate]
  )

  const handleFocus = () => {
    setIsFocused(true)
    // Select all text on focus for easy overwrite
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (currentUrl) {
      setValue(cleanUrlForDisplay(currentUrl))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex items-center min-w-0">
      <div
        className={`
          flex items-center gap-2 w-full h-8 px-3 rounded-lg
          bg-zinc-800/80 border transition-all duration-200
          ${isFocused
            ? 'border-accent-500/50 ring-1 ring-accent-500/20 bg-zinc-800'
            : 'border-white/[0.06] hover:border-white/[0.12]'
          }
        `}
      >
        {/* Icon: search or loading */}
        <div className="shrink-0 w-4 h-4 flex items-center justify-center text-zinc-500">
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="hover:text-zinc-300 transition-colors"
              aria-label="Stop loading"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="1" fill="currentColor" />
              </svg>
            </button>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search or enter address"
          spellCheck={false}
          autoComplete="off"
          className={`
            flex-1 min-w-0 bg-transparent outline-none text-[13px]
            placeholder:text-zinc-600
            ${isFocused ? 'text-zinc-100' : 'text-zinc-400'}
          `}
          aria-label="Address bar"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="shrink-0 w-3 h-3">
            <div className="w-3 h-3 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </form>
  )
}

/** Strip protocol and trailing slash for a cleaner display */
function cleanUrlForDisplay(url: string): string {
  try {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
  } catch {
    return url
  }
}
