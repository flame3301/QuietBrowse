import type { QuietBrowseAPI } from '../preload/index'

declare global {
  interface Window {
    quietBrowse: QuietBrowseAPI
  }
}
