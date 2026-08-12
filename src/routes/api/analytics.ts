import { createFileRoute } from '@tanstack/react-router'

const maximumPayloadBytes = 256

function isSafePath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.includes('?') &&
    !value.includes('#') &&
    value.length <= 120
  )
}

export const Route = createFileRoute('/api/analytics')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentLength = Number(request.headers.get('Content-Length') || 0)

        if (contentLength > maximumPayloadBytes) {
          return new Response(null, { status: 413 })
        }

        let payload: unknown

        try {
          payload = await request.json()
        } catch {
          return new Response(null, { status: 400 })
        }

        const path =
          payload && typeof payload === 'object' && 'path' in payload
            ? payload.path
            : undefined

        if (!isSafePath(path)) {
          return new Response(null, { status: 422 })
        }

        console.info(
          JSON.stringify({
            at: new Date().toISOString(),
            event: 'page_view',
            path,
          }),
        )

        return new Response(null, {
          headers: { 'Cache-Control': 'no-store' },
          status: 204,
        })
      },
    },
  },
})
