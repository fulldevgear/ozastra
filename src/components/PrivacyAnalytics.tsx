import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

export function allowsPrivacyAnalytics({
  doNotTrack,
  globalPrivacyControl,
}: {
  doNotTrack: string | null
  globalPrivacyControl?: boolean
}) {
  return globalPrivacyControl !== true && doNotTrack !== '1'
}

function privacySignalEnabled() {
  const privacyNavigator = navigator as Navigator & {
    globalPrivacyControl?: boolean
  }

  return !allowsPrivacyAnalytics(privacyNavigator)
}

export function PrivacyAnalytics() {
  const pathname = useLocation({ select: (location) => location.pathname })

  useEffect(() => {
    if (privacySignalEnabled()) return

    void fetch('/api/analytics', {
      body: JSON.stringify({ path: pathname }),
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      method: 'POST',
    })
  }, [pathname])

  return null
}
