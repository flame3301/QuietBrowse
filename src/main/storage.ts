import { app } from 'electron'
import { join } from 'path'
import { CoreDatabase } from '@xenodb/server'

/**
 * QuietBrowse — Storage Layer
 *
 * Uses XenoDB's CoreDatabase for local persistent storage.
 * Data is stored in the user's app data directory.
 *
 * Collections:
 *   - history:    browsing history entries
 *   - bookmarks:  saved bookmarks
 *   - settings:   app preferences
 */

// ── Types ────────────────────────────────────────

export interface HistoryEntry {
  url: string
  title: string
  favicon: string
  visitedAt: number       // Unix timestamp ms
  visitCount: number
}

export interface Bookmark {
  url: string
  title: string
  favicon: string
  createdAt: number       // Unix timestamp ms
  folder: string          // e.g. "default", "reading-list"
}

export interface AppSettings {
  searchEngine: 'google' | 'duckduckgo' | 'bing' | 'brave'
  homepage: 'welcome' | 'last-session' | string
  theme: 'dark' | 'light' | 'system'
  sidebarCollapsed: boolean
  clearOnExit: boolean
  adBlockEnabled: boolean
  adBlockDisabledSites: string[]
  doNotTrack: boolean
  defaultZoom: number     // 1.0 = 100%
}

// ── Default settings ─────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  searchEngine: 'google',
  homepage: 'welcome',
  theme: 'dark',
  sidebarCollapsed: false,
  clearOnExit: false,
  adBlockEnabled: true,
  adBlockDisabledSites: [],
  doNotTrack: true,
  defaultZoom: 1.0
}

// ── Storage class ────────────────────────────────

class Storage {
  private historyDb!: CoreDatabase<HistoryEntry>
  private bookmarkDb!: CoreDatabase<Bookmark>
  private settingsDb!: CoreDatabase<AppSettings[keyof AppSettings]>

  private dataPath: string

  constructor() {
    this.dataPath = join(app.getPath('userData'), 'xenodb')
  }

  /** Initialize all databases */
  init(): void {
    this.historyDb = new CoreDatabase<HistoryEntry>(join(this.dataPath, 'history'))
    this.bookmarkDb = new CoreDatabase<Bookmark>(join(this.dataPath, 'bookmarks'))
    this.settingsDb = new CoreDatabase<AppSettings[keyof AppSettings]>(join(this.dataPath, 'settings'))

    // Ensure default settings exist
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      if (!this.settingsDb.has(key)) {
        this.settingsDb.set(key, value)
      }
    }
  }

  // ── History ──────────────────────────────────

  addHistory(url: string, title: string, favicon: string = ''): void {
    // Use URL as key (normalized)
    const key = this.normalizeUrl(url)
    const existing = this.historyDb.get(key)

    if (existing) {
      this.historyDb.set(key, {
        ...existing,
        title: title || existing.title,
        favicon: favicon || existing.favicon,
        visitedAt: Date.now(),
        visitCount: existing.visitCount + 1
      })
    } else {
      this.historyDb.set(key, {
        url,
        title: title || url,
        favicon,
        visitedAt: Date.now(),
        visitCount: 1
      })
    }
  }

  getHistory(): HistoryEntry[] {
    const all = this.historyDb.all()
    return Object.values(all)
      .sort((a, b) => b.visitedAt - a.visitedAt)
  }

  searchHistory(query: string): HistoryEntry[] {
    const q = query.toLowerCase()
    return this.getHistory().filter(
      (entry) =>
        entry.url.toLowerCase().includes(q) ||
        entry.title.toLowerCase().includes(q)
    )
  }

  clearHistory(): void {
    const all = this.historyDb.all()
    const keys = Object.keys(all)
    if (keys.length > 0) {
      this.historyDb.deleteMany(keys)
    }
  }

  deleteHistoryEntry(url: string): void {
    const key = this.normalizeUrl(url)
    this.historyDb.delete(key)
  }

  // ── Bookmarks ────────────────────────────────

  addBookmark(url: string, title: string, favicon: string = '', folder: string = 'default'): void {
    const key = this.normalizeUrl(url)
    this.bookmarkDb.set(key, {
      url,
      title: title || url,
      favicon,
      createdAt: Date.now(),
      folder
    })
  }

  removeBookmark(url: string): void {
    this.bookmarkDb.delete(this.normalizeUrl(url))
  }

  isBookmarked(url: string): boolean {
    return this.bookmarkDb.has(this.normalizeUrl(url))
  }

  getBookmarks(folder?: string): Bookmark[] {
    const all = this.bookmarkDb.all()
    const bookmarks = Object.values(all)
    if (folder) {
      return bookmarks.filter((b) => b.folder === folder).sort((a, b) => b.createdAt - a.createdAt)
    }
    return bookmarks.sort((a, b) => b.createdAt - a.createdAt)
  }

  // ── Settings ─────────────────────────────────

  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    const val = this.settingsDb.get(key)
    return (val ?? DEFAULT_SETTINGS[key]) as AppSettings[K]
  }

  setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settingsDb.set(key, value)
  }

  setAdBlockSiteEnabled(site: string, enabled: boolean): void {
    const sites = new Set(this.getSetting('adBlockDisabledSites'))
    if (enabled) {
      sites.delete(site)
    } else {
      sites.add(site)
    }
    this.setSetting('adBlockDisabledSites', [...sites])
  }

  getAllSettings(): AppSettings {
    const result = { ...DEFAULT_SETTINGS }
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[]) {
      const val = this.settingsDb.get(key)
      if (val !== null) {
        ;(result as Record<string, unknown>)[key] = val
      }
    }
    return result
  }

  // ── Utilities ────────────────────────────────

  private normalizeUrl(url: string): string {
    // Create a safe key from URL
    return url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 200)
  }
}

// Singleton
export const storage = new Storage()
