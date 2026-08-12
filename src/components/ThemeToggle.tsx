import { useEffect, useState, useSyncExternalStore } from 'react'

import { applyTheme, getDocumentTheme, subscribeToTheme } from '../lib/theme'
import type { Theme } from '../lib/theme'
import { copy } from '../i18n/messages'
import { useMessage } from '../i18n/use-message'

function getServerTheme(): Theme {
  return 'dark'
}

export function ThemeToggle() {
  const message = useMessage()
  const [isReady, setIsReady] = useState(false)
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getDocumentTheme,
    getServerTheme,
  )
  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const nextThemeLabel =
    nextTheme === 'light'
      ? message(copy.theme.activateLight)
      : message(copy.theme.activateDark)

  useEffect(() => setIsReady(true), [])

  return (
    <button
      aria-label={nextThemeLabel}
      className="theme-toggle"
      data-theme-ready={isReady}
      data-theme-active={theme}
      disabled={!isReady}
      onClick={() => applyTheme(nextTheme)}
      type="button"
    >
      <span className="theme-toggle__icon" aria-hidden="true" />
      <span className="theme-toggle__label">
        {theme === 'light'
          ? message(copy.theme.light)
          : message(copy.theme.dark)}
      </span>
    </button>
  )
}
