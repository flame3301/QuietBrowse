/// <reference types="vite/client" />

import type { QuietBrowseAPI } from '../preload/index'

declare module '*.css' {
  const css: string
  export default css
}

declare global {
  interface Window {
    quietBrowse: QuietBrowseAPI
  }
}
