import type { Messages } from '@lingui/core'

declare module '*.po' {
  export const messages: Messages
}
