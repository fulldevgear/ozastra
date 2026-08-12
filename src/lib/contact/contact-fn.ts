import { createServerFn } from '@tanstack/react-start'

import { processContactSubmission } from './contact-delivery'
import { contactSubmissionSchema } from './contact-schema'

export const submitContact = createServerFn({ method: 'POST' })
  .validator(contactSubmissionSchema)
  .handler(({ data }) => processContactSubmission(data))
