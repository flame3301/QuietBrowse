import { useCallback, useEffect, useMemo, useState } from 'react'

type PanelKind = 'bookmarks' | 'history' | 'downloads'

interface LibraryPanelProps {
  kind: PanelKind
  isOpen: boolean
  onClose: () => void
  onNavigate: (url: string) => void
}

interface Bookmark {
  url: string
  title: string
  favicon: string
  createdAt: number
}

interface HistoryEntry {
  url: string
  title: string
  favicon: string
  visitedAt: number
  visitCount: number
}

interface DownloadInfo {
  id: string
  filename: string
  url: string
  path: string
  state: 'progressing' | 'completed' | 'cancelled'
  receivedBytes: number
  totalBytes: number
}

const titles: Record<PanelKind, string> = {
  bookmarks: 'Bookmarks',
  history: 'History',
  downloads: 'Downloads'
}

export default function LibraryPanel({ kind, isOpen, onClose, onNavigate }: LibraryPanelProps) {
  const [query, setQuery] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [downloads, setDownloads] = useState<DownloadInfo[]>([])

  const refresh = useCallback(async () => {
    if (kind === 'bookmarks') setBookmarks((await window.quietBrowse.bookmarks.getAll()) as Bookmark[])
    if (kind === 'history') setHistory((await window.quietBrowse.history.search(query)) as HistoryEntry[])
    if (kind === 'downloads') setDownloads((await window.quietBrowse.downloads.getAll()) as DownloadInfo[])
  }, [kind, query])

  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    void refresh()
  }, [isOpen, refresh])

  useEffect(() => {
    if (!isOpen || kind !== 'downloads') return
    const handleDownload = () => void refresh()
    window.quietBrowse.on('download:updated', handleDownload)
    return () => window.quietBrowse.removeAllListeners('download:updated')
  }, [isOpen, kind, refresh])

  const filteredBookmarks = useMemo(
    () => bookmarks.filter((item) => `${item.title} ${item.url}`.toLowerCase().includes(query.toLowerCase())),
    [bookmarks, query]
  )
  const filteredHistory = useMemo(
    () => history.filter((item) => `${item.title} ${item.url}`.toLowerCase().includes(query.toLowerCase())),
    [history, query]
  )

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <section className="fixed inset-y-0 right-0 z-50 flex w-[440px] max-w-full flex-col border-l border-white/[0.08] bg-zinc-900 shadow-2xl">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
          <h2 className="text-sm font-semibold text-zinc-200">{titles[kind]}</h2>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200" aria-label={`Close ${titles[kind]}`}>×</button>
        </header>
        <div className="border-b border-white/[0.06] p-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${titles[kind].toLowerCase()}`}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-accent-500/50"
            aria-label={`Search ${titles[kind]}`}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {kind === 'bookmarks' && filteredBookmarks.map((item) => (
            <LibraryRow key={item.url} title={item.title} url={item.url} onClick={() => onNavigate(item.url)} onDelete={() => { window.quietBrowse.bookmarks.remove(item.url); void refresh() }} />
          ))}
          {kind === 'history' && filteredHistory.map((item) => (
            <LibraryRow key={`${item.url}-${item.visitedAt}`} title={item.title} url={item.url} meta={new Date(item.visitedAt).toLocaleString()} onClick={() => onNavigate(item.url)} onDelete={() => { window.quietBrowse.history.delete(item.url); void refresh() }} />
          ))}
          {kind === 'downloads' && downloads.filter((item) => `${item.filename} ${item.url}`.toLowerCase().includes(query.toLowerCase())).map((item) => (
            <LibraryRow key={item.id} title={item.filename} url={item.url} meta={item.state === 'progressing' && item.totalBytes > 0 ? `${Math.round(item.receivedBytes / item.totalBytes * 100)}%` : item.state} onClick={() => item.path && window.quietBrowse.downloads.open(item.path)} />
          ))}
          {((kind === 'bookmarks' && filteredBookmarks.length === 0) || (kind === 'history' && filteredHistory.length === 0) || (kind === 'downloads' && downloads.length === 0)) && (
            <p className="p-6 text-center text-xs text-zinc-600">Nothing here yet.</p>
          )}
        </div>
      </section>
    </>
  )
}

function LibraryRow({ title, url, meta, onClick, onDelete }: { title: string; url: string; meta?: string; onClick: () => void; onDelete?: () => void }) {
  return (
    <div className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/[0.05]">
      <button onClick={onClick} className="min-w-0 flex-1 text-left">
        <div className="truncate text-xs text-zinc-300">{title || url}</div>
        <div className="truncate text-[10px] text-zinc-600">{meta || url}</div>
      </button>
      {onDelete && <button onClick={onDelete} className="invisible rounded px-2 py-1 text-[10px] text-zinc-600 group-hover:visible hover:text-red-400" aria-label={`Remove ${title}`}>Remove</button>}
    </div>
  )
}
