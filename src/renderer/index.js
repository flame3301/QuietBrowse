/**
 * QuietBrowse — Renderer
 *
 * UI logic for the browser shell.
 * Communicates with the main process through the
 * contextBridge API exposed by the preload script.
 */

// ── Window Controls ──────────────────────────────
document.getElementById('btn-minimize')?.addEventListener('click', () => {
  window.quietBrowse.window.minimize()
})

document.getElementById('btn-maximize')?.addEventListener('click', () => {
  window.quietBrowse.window.maximize()
})

document.getElementById('btn-close')?.addEventListener('click', () => {
  window.quietBrowse.window.close()
})

// ── Version Display ──────────────────────────────
async function showVersion() {
  try {
    const version = await window.quietBrowse.app.getVersion()
    const el = document.getElementById('welcome-version')
    if (el) {
      el.textContent = `v${version}`
    }
  } catch {
    // Silently fail if not available yet
  }
}

showVersion()

// ── Keyboard Shortcuts (global) ──────────────────
document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+I — toggle DevTools (dev only)
  // All other shortcuts will be added in later stages
})

console.log(
  '%c QuietBrowse %c A browser with nothing in the way.',
  'background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
  'color: #9898a6; padding: 4px 0;'
)
