import { useLingui } from '@lingui/react'

import { isLocale } from './locales'
import type { Locale } from './locales'

export function useLocale(): Locale {
  const { i18n } = useLingui()
  if (!isLocale(i18n.locale)) {
    throw new Error(`Lingui activated unsupported locale "${i18n.locale}".`)
  }
  return i18n.locale
}

