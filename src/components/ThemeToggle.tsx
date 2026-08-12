import { useEffect, useState, useSyncExternalStore } from 'react'

import { applyTheme, getDocumentTheme, subscribeToTheme } from '../lib/theme'
import type { Theme } from '../lib/theme'

function getServerTheme(): Theme {
  return 'dark'
}

export function ThemeToggle() {
  const [isReady, setIsReady] = useState(false)
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getDocumentTheme,
    getServerTheme,
  )
  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const nextThemeLabel = nextTheme === 'light' ? 'clair' : 'sombre'

  useEffect(() => setIsReady(true), [])

  return (
    <button
      aria-label={`Activer le thème ${nextThemeLabel}`}
      className="theme-toggle"
      data-theme-ready={isReady}
      data-theme-active={theme}
      disabled={!isReady}
      onClick={() => applyTheme(nextTheme)}
      type="button"
    >
      <span className="theme-toggle__icon" aria-hidden="true" />
      <span className="theme-toggle__label">
        {theme === 'light' ? 'Clair' : 'Sombre'}
      </span>
    </button>
  )
}
