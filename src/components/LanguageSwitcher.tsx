import { useLocation } from '@tanstack/react-router'

import { publishedLocales, getLocaleDefinition } from '../i18n/locales'
import { copy } from '../i18n/messages'
import { switchLocalePath } from '../i18n/navigation'
import { useLocale } from '../i18n/use-locale'
import { useMessage } from '../i18n/use-message'

export function LanguageSwitcher() {
  const locale = useLocale()
  const message = useMessage()
  const pathname = useLocation({ select: (location) => location.pathname })

  return (
    <nav
      className="language-switcher"
      aria-label={message(copy.shell.languageSelection)}
    >
      {publishedLocales.map((targetLocale) => (
        <a
          aria-current={targetLocale === locale ? 'page' : undefined}
          href={switchLocalePath(pathname, targetLocale)}
          hrefLang={targetLocale}
          key={targetLocale}
          lang={targetLocale}
        >
          {getLocaleDefinition(targetLocale).nativeLabel}
        </a>
      ))}
    </nav>
  )
}
