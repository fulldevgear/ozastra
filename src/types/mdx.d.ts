declare module '*.mdx' {
  import type { ComponentType } from 'react'

  export const metadata: unknown
  const Component: ComponentType
  export default Component
}
