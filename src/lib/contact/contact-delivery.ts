import type { ContactResult, ContactSubmission } from './contact-schema'

type ContactEnvironment = {
  CONTACT_PROVIDER_API_KEY?: string
  CONTACT_RECIPIENT?: string
  CONTACT_SENDER?: string
  CONTACT_RATE_LIMIT_MAX?: string
  CONTACT_RATE_LIMIT_WINDOW_SECONDS?: string
}

const attempts = new Map<string, number[]>()

function withinRateLimit(
  key: string,
  now: number,
  maximum: number,
  windowMs: number,
) {
  const recent = (attempts.get(key) ?? []).filter(
    (timestamp) => timestamp > now - windowMs,
  )
  if (recent.length >= maximum) return false
  recent.push(now)
  attempts.set(key, recent)
  return true
}

export async function processContactSubmission(
  submission: ContactSubmission,
  options: {
    env?: ContactEnvironment
    fetcher?: typeof fetch
    now?: number
  } = {},
): Promise<ContactResult> {
  const env = options.env ?? process.env
  const fetcher = options.fetcher ?? fetch
  const now = options.now ?? Date.now()

  if (submission.company || now - submission.startedAt < 800) {
    return { status: 'rejected', reason: 'spam' }
  }

  const rateLimitMaximum = Math.max(1, Number(env.CONTACT_RATE_LIMIT_MAX ?? 5))
  const rateLimitWindowMs =
    Math.max(60, Number(env.CONTACT_RATE_LIMIT_WINDOW_SECONDS ?? 900)) * 1_000

  if (
    !withinRateLimit(submission.email, now, rateLimitMaximum, rateLimitWindowMs)
  ) {
    return { status: 'rejected', reason: 'rate_limited' }
  }

  const apiKey = env.CONTACT_PROVIDER_API_KEY
  const recipient = env.CONTACT_RECIPIENT
  const sender = env.CONTACT_SENDER
  if (!apiKey || !recipient || !sender) {
    return { status: 'fallback', reason: 'not_configured' }
  }

  const text = [
    `Nouveau contact Ozastra — ${submission.project}`,
    '',
    `Nom : ${submission.name}`,
    `Email : ${submission.email}`,
    `Projet : ${submission.project}`,
    '',
    submission.message,
  ].join('\n')

  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: submission.email,
        subject: `[Ozastra] ${submission.project} — ${submission.name}`,
        text,
      }),
    })

    if (!response.ok) {
      return { status: 'fallback', reason: 'delivery_failed' }
    }

    const payload = (await response.json()) as { id?: unknown }
    return typeof payload.id === 'string'
      ? { status: 'sent', id: payload.id }
      : { status: 'fallback', reason: 'delivery_failed' }
  } catch {
    return { status: 'fallback', reason: 'delivery_failed' }
  }
}
