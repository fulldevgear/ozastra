import { z } from 'zod'

export const projectTypes = [
  'web',
  'saas',
  'ai',
  'mobile',
  'partnership',
  'other',
] as const

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  project: z.enum(projectTypes),
  message: z.string().trim().min(20).max(4_000),
  company: z.string().max(200).default(''),
  startedAt: z.number().int().positive(),
})

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>

export type ContactResult =
  | { status: 'sent'; id: string }
  | { status: 'fallback'; reason: 'not_configured' | 'delivery_failed' }
  | { status: 'rejected'; reason: 'spam' | 'rate_limited' }
