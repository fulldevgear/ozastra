import { useRef, useState } from 'react'

import { copy } from '../i18n/messages'
import { useMessage } from '../i18n/use-message'
import { createContactMailtoUrl } from '../lib/contact/contact-mailto'
import { contactSubmissionSchema } from '../lib/contact/contact-schema'

type FormState =
  { name: 'idle' } | { name: 'invalid'; message: string } | { name: 'ready' }

export function ContactForm() {
  const message = useMessage()
  const startedAt = useRef(Date.now())
  const [state, setState] = useState<FormState>({ name: 'idle' })

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

    if (parsed.data.company) {
      setState({ name: 'invalid', message: message(copy.contact.invalid) })
      return
    }

    setState({ name: 'ready' })
    window.location.assign(createContactMailtoUrl(parsed.data))
  }

  return (
    <form
      className="contact-form"
      action="mailto:hello@ozastra.com"
      method="post"
      encType="text/plain"
      onSubmit={handleSubmit}
    >
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
      <button className="button-primary" type="submit">
        {message(copy.contact.submit)}
      </button>

      <div className="form-status" aria-live="polite" aria-atomic="true">
        {state.name === 'invalid' && <p role="alert">{state.message}</p>}
        {state.name === 'ready' && (
          <p className="form-status--success">
            {message(copy.contact.draftReady)}
          </p>
        )}
      </div>
    </form>
  )
}
