export type Theme = 'dark' | 'light'

export const themeStorageKey = 'ozastra-theme'
export const themeChangeEvent = 'ozastra:theme-change'

export const themeColors: Record<Theme, string> = {
  dark: '#07090F',
  light: '#F3F0E8',
}

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light'
}

export function resolveTheme(
  storedTheme: string | null,
  prefersLight: boolean,
): Theme {
  if (isTheme(storedTheme)) return storedTheme
  return prefersLight ? 'light' : 'dark'
}

export const themeBootstrapScript = `(()=>{try{const k='${themeStorageKey}',s=localStorage.getItem(k),t=s==='light'||s==='dark'?s:matchMedia('(prefers-color-scheme: light)').matches?'light':'dark',r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==='light'?'${themeColors.light}':'${themeColors.dark}'}catch{}})()`

export function getDocumentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return isTheme(document.documentElement.dataset.theme)
    ? document.documentElement.dataset.theme
    : 'dark'
}

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.localStorage.getItem(themeStorageKey)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

export function applyTheme(theme: Theme, persist = true) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', themeColors[theme])

  if (persist) {
    try {
      window.localStorage.setItem(themeStorageKey, theme)
    } catch {
      // The visual preference still applies when storage is unavailable.
    }
  }

  window.dispatchEvent(new CustomEvent(themeChangeEvent, { detail: theme }))
}

export function subscribeToTheme(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: light)')

  const syncUnstoredPreference = () => {
    if (getStoredTheme() === null) {
      applyTheme(media.matches ? 'light' : 'dark', false)
    }
  }
  const syncStoredPreference = (event: StorageEvent) => {
    if (event.key !== themeStorageKey) return

    const storedTheme = getStoredTheme()
    applyTheme(storedTheme ?? (media.matches ? 'light' : 'dark'), false)
  }

  window.addEventListener(themeChangeEvent, onChange)
  window.addEventListener('storage', syncStoredPreference)
  media.addEventListener('change', syncUnstoredPreference)

  return () => {
    window.removeEventListener(themeChangeEvent, onChange)
    window.removeEventListener('storage', syncStoredPreference)
    media.removeEventListener('change', syncUnstoredPreference)
  }
}
