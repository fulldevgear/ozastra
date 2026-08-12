import { describe, expect, it, vi } from 'vitest'

import { processContactSubmission } from './contact-delivery'
import { contactSubmissionSchema } from './contact-schema'

const submission = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  project: 'ai' as const,
  message: 'Nous voulons transformer un workflow métier complexe en produit.',
  company: '',
  startedAt: 1_000,
}

describe('contactSubmissionSchema', () => {
  it('normalizes a valid submission and rejects short messages', () => {
    expect(contactSubmissionSchema.parse(submission).email).toBe(
      'ada@example.com',
    )
    expect(() =>
      contactSubmissionSchema.parse({ ...submission, message: 'Trop court' }),
    ).toThrow()
  })
})

describe('processContactSubmission', () => {
  it('uses the controlled fallback when no provider is configured', async () => {
    await expect(
      processContactSubmission(submission, { env: {}, now: 5_000 }),
    ).resolves.toEqual({ status: 'fallback', reason: 'not_configured' })
  })

  it('rejects the honeypot without contacting the provider', async () => {
    const fetcher = vi.fn<typeof fetch>()
    await expect(
      processContactSubmission(
        { ...submission, email: 'bot@example.com', company: 'Spam Corp' },
        { fetcher, now: 5_000 },
      ),
    ).resolves.toEqual({ status: 'rejected', reason: 'spam' })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('sends through the server-only Resend adapter', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: 'email_123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      processContactSubmission(
        { ...submission, email: 'configured@example.com' },
        {
          fetcher,
          now: 5_000,
          env: {
            CONTACT_PROVIDER_API_KEY: 'secret',
            CONTACT_RECIPIENT: 'hello@ozastra.com',
            CONTACT_SENDER: 'Ozastra <website@ozastra.com>',
          },
        },
      ),
    ).resolves.toEqual({ status: 'sent', id: 'email_123' })

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
