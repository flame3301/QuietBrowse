import { useEffect, useState, useRef } from 'react'

interface WelcomeProps {
  onNavigate?: (input: string) => void
}

export default function Welcome({ onNavigate }: WelcomeProps) {
  const [version, setVersion] = useState<string>('')
  const [searchValue, setSearchValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.quietBrowse.app.getVersion().then((v) => setVersion(v)).catch(() => {})
    // Auto-focus the search input
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchValue.trim()
    if (trimmed && onNavigate) {
      onNavigate(trimmed)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,var(--color-glow),transparent_70%)] animate-glow-pulse pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center gap-5 animate-fade-in-up">
        {/* Icon */}
        <div className="w-20 h-20 flex items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-xl animate-float">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <circle cx="28" cy="28" r="20" stroke="url(#grad)" strokeWidth="3" fill="none" />
            <line x1="42" y1="42" x2="58" y2="58" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold bg-gradient-to-br from-accent-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
          QuietBrowse
        </h1>

        {/* Subtitle */}
        <p className="text-base font-light text-zinc-400 max-w-xs leading-relaxed">
          A browser with nothing in the way.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-md mt-2">
          <div className="flex items-center gap-3 h-11 px-4 rounded-xl bg-zinc-800/60 border border-white/[0.08] hover:border-white/[0.15] focus-within:border-accent-500/50 focus-within:ring-1 focus-within:ring-accent-500/20 transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-zinc-500">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search or enter address"
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-600"
            />
          </div>
        </form>

        {/* Version badge */}
        {version && (
          <span className="text-[11px] text-zinc-600 font-mono px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full">
            v{version}
          </span>
        )}

        {/* Keyboard hints */}
        <div className="text-sm text-zinc-600 space-x-4">
          <span>
            <kbd className="inline-block px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 bg-zinc-800 border border-zinc-700 rounded shadow-[inset_0_-1px_0_rgba(0,0,0,0.3)]">
              Ctrl+T
            </kbd>{' '}
            New tab
          </span>
          <span>
            <kbd className="inline-block px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 bg-zinc-800 border border-zinc-700 rounded shadow-[inset_0_-1px_0_rgba(0,0,0,0.3)]">
              Ctrl+L
            </kbd>{' '}
            Address bar
          </span>
          <span>
            <kbd className="inline-block px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 bg-zinc-800 border border-zinc-700 rounded shadow-[inset_0_-1px_0_rgba(0,0,0,0.3)]">
              Ctrl+W
            </kbd>{' '}
            Close tab
          </span>
        </div>
      </div>
    </div>
  )
}
