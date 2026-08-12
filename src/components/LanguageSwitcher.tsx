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
  const currentLocale = getLocaleDefinition(locale)

  return (
    <nav
      className="language-switcher"
      aria-label={message(copy.shell.languageSelection)}
    >
      <details suppressHydrationWarning>
        <summary>
          <span lang={locale}>{currentLocale.nativeLabel}</span>
          <span className="language-switcher__chevron" aria-hidden="true" />
        </summary>
        <div className="language-switcher__menu">
          {publishedLocales.map((targetLocale) => {
            const definition = getLocaleDefinition(targetLocale)

            return (
              <a
                aria-current={targetLocale === locale ? 'page' : undefined}
                href={switchLocalePath(pathname, targetLocale)}
                hrefLang={targetLocale}
                key={targetLocale}
                lang={targetLocale}
              >
                <span>{definition.nativeLabel}</span>
                <span className="language-switcher__code" aria-hidden="true">
                  {targetLocale}
                </span>
              </a>
            )
          })}
        </div>
      </details>
    </nav>
  )
}
