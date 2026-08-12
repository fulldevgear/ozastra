import { useEffect, useRef, useState } from 'react'

import { copy } from '../i18n/messages'
import { useMessage } from '../i18n/use-message'
import { submitContact } from '../lib/contact/contact-fn'
import { contactSubmissionSchema } from '../lib/contact/contact-schema'
import type { ContactResult } from '../lib/contact/contact-schema'

type FormState =
  | { name: 'idle' }
  | { name: 'loading' }
  | { name: 'invalid'; message: string }
  | { name: 'complete'; result: ContactResult }

export function ContactForm() {
  const message = useMessage()
  const startedAt = useRef(Date.now())
  const [isHydrated, setIsHydrated] = useState(false)
  const [state, setState] = useState<FormState>({ name: 'idle' })

  useEffect(() => setIsHydrated(true), [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const parsed = contactSubmissionSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      project: formData.get('project'),
      message: formData.get('message'),
      company: formData.get('company') ?? '',
      startedAt: startedAt.current,
    })

    if (!parsed.success) {
      setState({
        name: 'invalid',
        message: message(copy.contact.invalid),
      })
      return
    }

    setState({ name: 'loading' })
    try {
      const result = await submitContact({ data: parsed.data })
      setState({ name: 'complete', result })
      if (result.status === 'sent') {
        form.reset()
        startedAt.current = Date.now()
      }
    } catch {
      setState({
        name: 'complete',
        result: { status: 'fallback', reason: 'delivery_failed' },
      })
    }
  }

  const isLoading = state.name === 'loading'

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="name">{message(copy.contact.name)}</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
        />
      </div>
      <div className="form-field">
        <label htmlFor="email">{message(copy.contact.email)}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="project">{message(copy.contact.projectType)}</label>
        <select id="project" name="project" defaultValue="" required>
          <option value="" disabled>
            {message(copy.contact.select)}
          </option>
          <option value="web">{message(copy.contact.web)}</option>
          <option value="saas">{message(copy.contact.saas)}</option>
          <option value="ai">{message(copy.contact.ai)}</option>
          <option value="mobile">{message(copy.contact.mobile)}</option>
          <option value="partnership">
            {message(copy.contact.partnership)}
          </option>
          <option value="other">{message(copy.contact.other)}</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="message">{message(copy.contact.project)}</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          minLength={20}
          maxLength={4_000}
          required
          placeholder={message(copy.contact.placeholder)}
        />
      </div>
      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="company">{message(copy.contact.honeypot)}</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <button
        className="button-primary"
        type="submit"
        disabled={!isHydrated || isLoading}
        aria-busy={isLoading}
      >
        {isLoading
          ? message(copy.contact.submitting)
          : message(copy.contact.submit)}
      </button>

      <div className="form-status" aria-live="polite" aria-atomic="true">
        {state.name === 'invalid' && <p role="alert">{state.message}</p>}
        {state.name === 'complete' && state.result.status === 'sent' && (
          <p className="form-status--success">
            {message(copy.contact.success)}
          </p>
        )}
        {state.name === 'complete' && state.result.status === 'rejected' && (
          <p role="alert">{message(copy.contact.rejected)}</p>
        )}
        {state.name === 'complete' && state.result.status === 'fallback' && (
          <p role="alert">
            {message(copy.contact.fallbackBefore)}{' '}
            <a href="mailto:hello@ozastra.com?subject=Ozastra%20project">
              hello@ozastra.com
            </a>
            .
          </p>
        )}
      </div>
    </form>
  )
}
