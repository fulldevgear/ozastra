import { describe, expect, it } from 'vitest'

import { securityHeaders, withSecurityHeaders } from './security-headers'

describe('security headers', () => {
  it('applies the complete production header policy without altering the body', async () => {
    const source = new Response('ok', {
      headers: { 'Content-Type': 'text/plain' },
      status: 201,
    })

    const secured = withSecurityHeaders(source)

    expect(secured.status).toBe(201)
    expect(secured.headers.get('Content-Type')).toBe('text/plain')
    expect(await secured.text()).toBe('ok')

    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(secured.headers.get(name)).toBe(value)
    }
  })
})
