<div align="center">

# QuietBrowse

**A distraction-free, minimal web browser for Windows.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078D4.svg)](#)
[![Built with Electron](https://img.shields.io/badge/Built%20with-Electron-47848F.svg)](https://www.electronjs.org/)

*Inspired by [Search](https://github.com/driceroland/Search) for macOS by Office Commun.*

</div>

---

## What it is

QuietBrowse is a browser with nothing in the way. A row of tabs down the left side and the page. There is no toolbar, no start page, no sidebar of suggestions, no account to sign into, nothing that wants your attention. You type an address or a few words in one field and you are on the page.

It was built for people who spend their whole day in a browser and are tired of the ones that became products. This one is a tool.

## Why

The original [Search](https://github.com/driceroland/Search) browser by Office Commun is a beautiful, minimal browser — but it only runs on macOS with WebKit. QuietBrowse brings the same philosophy to **Windows**, built with Electron and Chromium, and released as free, open-source software.

## Features

- **One field.** Type an address and you go there; type words and you search. Autocomplete from your own history, never sends what you type anywhere until you press Enter.
- **Tabs that stay out of the way.** Vertical side tabs. Pin the pages you keep open all day and they shrink to their icon. Session restore brings back your tabs instantly.
- **Reading mode.** `Ctrl+Shift+R` strips a page down to the article.
- **Hide anything, for good.** `Ctrl+Shift+H`, then click a cookie banner, a newsletter overlay, any clutter — it goes, and it's still gone on that site next time.
- **Built-in ad blocker.** Third-party trackers and ad networks are stopped at the network level. On by default, off per site if something breaks.
- **Picture-in-Picture.** `Ctrl+Shift+P` lifts a video out of the page into a small floating window.
- **Dark, light, or system.** The window and pages follow your Windows theme.
- **Bookmarks, history, downloads** — each a searchable panel, each one keystroke away.
- **No telemetry, no sync, no cloud.** Your tabs, history, and data are on your PC and nowhere else.
- **Auto-updates.** Checks for a newer build, downloads it, and installs on next launch. Nothing restarts on its own.
- **Code-signed.** Signed via [SignPath.io](https://signpath.io) so Windows SmartScreen trusts it from day one.

## Download

> 🚧 **Coming soon.** The first release is being prepared. Star/watch this repo to be notified.

<!--
**[Download for Windows →](https://github.com/flame3301/QuietBrowse/releases/latest)** · Windows 10/11 · free · about 80 MB
-->

## Build from source

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [Git](https://git-scm.com/)

### Steps

```bash
git clone https://github.com/flame3301/QuietBrowse.git
cd QuietBrowse
npm install
npm run dev
```

To create a distributable installer:

```bash
npm run build
npm run dist:win
```

The installer will be in `dist-electron/`.

## Privacy

| What | Where it is | Who can read it |
|---|---|---|
| History, bookmarks, open tabs | Local XenoDB store in `%APPDATA%/QuietBrowse/` | You. |
| Settings | Local XenoDB store in `%APPDATA%/QuietBrowse/` | You. |
| Cookies and site data | Chromium's own store for the app | The sites that set them, as in any browser. |
| Anything else | Nowhere. There is no server. | — |

A **private tab** (`Ctrl+Shift+N`) has its own cookie jar that is erased when you close it.

## Keyboard shortcuts

| Action | Shortcut |
|---|---|
| New tab | `Ctrl+T` |
| Close tab | `Ctrl+W` |
| Switch tab | `Ctrl+1` – `Ctrl+9` |
| Address bar | `Ctrl+L` / `F6` |
| Find in page | `Ctrl+F` |
| Reading mode | `Ctrl+Shift+R` |
| Hide element | `Ctrl+Shift+H` |
| Picture-in-Picture | `Ctrl+Shift+P` |
| Private tab | `Ctrl+Shift+N` |
| Bookmarks | `Ctrl+B` |
| History | `Ctrl+H` |
| Downloads | `Ctrl+J` |
| Settings | `Ctrl+,` |

## Credits

- Inspired by [Search](https://github.com/driceroland/Search) by [Office Commun](https://officecommun.com) (MIT License)
- Built with [Electron](https://www.electronjs.org/), [electron-vite](https://electron-vite.org/), and [XenoDB](https://www.npmjs.com/package/@xenodb/server)

## License

[MIT](LICENSE) — free to use, modify, and distribute.
