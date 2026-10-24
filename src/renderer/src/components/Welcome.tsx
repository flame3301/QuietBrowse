import { useEffect, useState } from 'react'

export default function Welcome() {
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    window.quietBrowse.app.getVersion().then((v) => setVersion(v)).catch(() => {})
  }, [])

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,var(--color-glow),transparent_70%)] animate-glow-pulse pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center gap-4 animate-fade-in-up">
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

        {/* Version badge */}
        {version && (
          <span className="text-[11px] text-zinc-600 font-mono px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full">
            v{version}
          </span>
        )}

        {/* Keyboard hints */}
        <div className="text-sm text-zinc-600 mt-3 space-x-4">
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
