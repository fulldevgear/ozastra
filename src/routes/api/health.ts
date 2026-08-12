import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          {
            service: 'ozastra-web',
            status: 'ok',
          },
          {
            headers: {
              'Cache-Control': 'no-store',
            },
          },
        ),
    },
  },
})
