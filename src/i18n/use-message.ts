import { useLingui } from '@lingui/react'
import type { MessageDescriptor } from '@lingui/core'

export function useMessage() {
  const { i18n } = useLingui()
  return (message: MessageDescriptor, values?: Record<string, unknown>) =>
    values
      ? i18n._(
          message.id,
          { ...message.values, ...values },
          { message: message.message },
        )
      : i18n._(message)
}
