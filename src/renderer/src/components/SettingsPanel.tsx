import { useEffect, useState, useCallback } from 'react'

interface AppSettings {
  searchEngine: 'google' | 'duckduckgo' | 'bing' | 'brave'
  homepage: 'welcome' | 'last-session' | string
  theme: 'dark' | 'light' | 'system'
  sidebarCollapsed: boolean
  clearOnExit: boolean
  adBlockEnabled: boolean
  doNotTrack: boolean
  defaultZoom: number
}

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const SEARCH_ENGINES = [
  { value: 'google', label: 'Google', icon: '🔍' },
  { value: 'duckduckgo', label: 'DuckDuckGo', icon: '🦆' },
  { value: 'bing', label: 'Bing', icon: '🅱️' },
  { value: 'brave', label: 'Brave Search', icon: '🦁' }
]

const ZOOM_LEVELS = [0.75, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5]

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [activeSection, setActiveSection] = useState<'general' | 'privacy' | 'about'>('general')

  useEffect(() => {
    if (isOpen) {
      window.quietBrowse.settings.getAll().then((s: unknown) => setSettings(s as AppSettings))
    }
  }, [isOpen])

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
    window.quietBrowse.settings.set(key, value)
  }, [settings])

  const handleClearHistory = useCallback(() => {
    if (confirm('Clear all browsing history?')) {
      window.quietBrowse.history.clear()
    }
  }, [])

  if (!isOpen || !settings) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in-up"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-[420px] max-w-full bg-zinc-900 border-l border-white/[0.06] z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-5 border-b border-white/[0.06] shrink-0">
          <h2 className="text-sm font-semibold text-zinc-200">Settings</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
            aria-label="Close settings"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0">
          {(['general', 'privacy', 'about'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`
                px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors
                ${activeSection === section
                  ? 'bg-accent-500/15 text-accent-400'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }
              `}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {activeSection === 'general' && (
            <>
              {/* Search Engine */}
              <SettingGroup title="Search Engine">
                <div className="grid grid-cols-2 gap-2">
                  {SEARCH_ENGINES.map((se) => (
                    <button
                      key={se.value}
                      onClick={() => updateSetting('searchEngine', se.value as AppSettings['searchEngine'])}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                        ${settings.searchEngine === se.value
                          ? 'bg-accent-500/15 text-accent-400 border border-accent-500/30'
                          : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/[0.12]'
                        }
                      `}
                    >
                      <span>{se.icon}</span>
                      <span>{se.label}</span>
                    </button>
                  ))}
                </div>
              </SettingGroup>

              {/* Default Zoom */}
              <SettingGroup title="Default Zoom">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={ZOOM_LEVELS.length - 1}
                    value={ZOOM_LEVELS.indexOf(settings.defaultZoom)}
                    onChange={(e) => updateSetting('defaultZoom', ZOOM_LEVELS[parseInt(e.target.value)])}
                    className="flex-1 accent-accent-500"
                  />
                  <span className="text-xs text-zinc-400 font-mono w-10 text-right">
                    {Math.round(settings.defaultZoom * 100)}%
                  </span>
                </div>
              </SettingGroup>

              {/* Homepage */}
              <SettingGroup title="On Startup">
                <select
                  value={settings.homepage}
                  onChange={(e) => updateSetting('homepage', e.target.value as AppSettings['homepage'])}
                  className="w-full bg-zinc-800 text-zinc-300 text-xs border border-white/[0.06] rounded-lg px-3 py-2 outline-none focus:border-accent-500/50"
                >
                  <option value="welcome">Show Welcome page</option>
                  <option value="last-session">Restore last session</option>
                </select>
              </SettingGroup>
            </>
          )}

          {activeSection === 'privacy' && (
            <>
              {/* Privacy toggles */}
              <SettingGroup title="Privacy">
                <ToggleRow
                  label="Send Do Not Track header"
                  description="Requests websites not to track your browsing"
                  checked={settings.doNotTrack}
                  onChange={(v) => updateSetting('doNotTrack', v)}
                />
                <ToggleRow
                  label="Clear data on exit"
                  description="History and cache are wiped when you close the app"
                  checked={settings.clearOnExit}
                  onChange={(v) => updateSetting('clearOnExit', v)}
                />
              </SettingGroup>

              {/* Data management */}
              <SettingGroup title="Data">
                <button
                  onClick={handleClearHistory}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/5 text-zinc-400 hover:text-red-400 transition-colors text-xs"
                >
                  <span>Clear browsing history</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4h10M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M3 4v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </SettingGroup>
            </>
          )}

          {activeSection === 'about' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                  <circle cx="28" cy="28" r="20" stroke="url(#gradAbout)" strokeWidth="3" fill="none" />
                  <line x1="42" y1="42" x2="58" y2="58" stroke="url(#gradAbout)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradAbout" x1="0" y1="0" x2="64" y2="64">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-200">QuietBrowse</h3>
                <p className="text-xs text-zinc-500 mt-1">A browser with nothing in the way.</p>
              </div>
              <div className="text-[11px] text-zinc-600 font-mono">v0.1.0</div>
              <div className="space-y-1 text-xs text-zinc-500">
                <p>Built with Electron + React + TypeScript</p>
                <p>
                  Open source on{' '}
                  <span className="text-accent-400">github.com/flame3301/QuietBrowse</span>
                </p>
                <p className="text-zinc-600">MIT License © flame3301</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Sub-components ──────────────────────────────

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-zinc-300">{label}</div>
        <div className="text-[11px] text-zinc-600 mt-0.5">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 mt-0.5
          ${checked ? 'bg-accent-500' : 'bg-zinc-700'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  )
}
