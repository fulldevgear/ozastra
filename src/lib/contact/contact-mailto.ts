import type { ContactSubmission } from './contact-schema'

const contactAddress = 'hello@ozastra.com'

export function createContactMailtoUrl(
  submission: Pick<ContactSubmission, 'email' | 'message' | 'name' | 'project'>,
) {
  const subject = `Ozastra project — ${submission.project}`
  const body = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Project type: ${submission.project}`,
    '',
    submission.message,
  ].join('\r\n')

  return `mailto:${contactAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
