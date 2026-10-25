import { session, type OnBeforeRequestListenerDetails } from 'electron'

const BLOCKED_HOSTS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'adnxs.com',
  'adsrvr.org',
  'rubiconproject.com',
  'pubmatic.com',
  'scorecardresearch.com',
  'outbrain.com',
  'taboola.com',
  'zedo.com',
  'criteo.com',
  'amazon-adsystem.com'
]

function hostnameFor(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

function matchesBlockedHost(hostname: string): boolean {
  return BLOCKED_HOSTS.some((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`))
}

export class AdBlocker {
  private enabled = true
  private readonly disabledSites = new Set<string>()
  private readonly registeredSessions = new Set<string>()

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  setSiteEnabled(site: string, enabled: boolean): void {
    const hostname = hostnameFor(site)
    if (!hostname) return
    if (enabled) {
      this.disabledSites.delete(hostname)
    } else {
      this.disabledSites.add(hostname)
    }
  }

  isEnabledForSite(site: string): boolean {
    const hostname = hostnameFor(site)
    return this.enabled && !!hostname && !this.disabledSites.has(hostname)
  }

  register(targetSession: Electron.Session = session.defaultSession): void {
    const key = targetSession === session.defaultSession ? 'default' : String(targetSession.getStoragePath() ?? 'session')
    if (this.registeredSessions.has(key)) return
    this.registeredSessions.add(key)

    const listener = (details: OnBeforeRequestListenerDetails, callback: (response: { cancel: boolean }) => void): void => {
      const requestHost = hostnameFor(String(details.url ?? ''))
      const pageHost = hostnameFor(String(details.referrer ?? ''))
      callback({
        cancel: this.isEnabledForSite(pageHost || requestHost) && matchesBlockedHost(requestHost)
      })
    }
    targetSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, listener)
  }
}
