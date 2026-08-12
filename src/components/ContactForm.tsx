import { useEffect, useRef, useState } from 'react'

import { submitContact } from '../lib/contact/contact-fn'
import { contactSubmissionSchema } from '../lib/contact/contact-schema'
import type { ContactResult } from '../lib/contact/contact-schema'

type FormState =
  | { name: 'idle' }
  | { name: 'loading' }
  | { name: 'invalid'; message: string }
  | { name: 'complete'; result: ContactResult }

export function ContactForm() {
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
        message:
          'Vérifiez les champs et détaillez votre projet en quelques mots.',
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
        <label htmlFor="name">Nom</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
        />
      </div>
      <div className="form-field">
        <label htmlFor="email">Email professionnel</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="project">Type de projet</label>
        <select id="project" name="project" defaultValue="" required>
          <option value="" disabled>
            Sélectionner
          </option>
          <option value="web">Site ou plateforme web</option>
          <option value="saas">Produit SaaS</option>
          <option value="ai">IA appliquée</option>
          <option value="mobile">Application mobile</option>
          <option value="partnership">Renfort produit / freelance</option>
          <option value="other">Autre projet</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="message">Votre projet</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          minLength={20}
          maxLength={4_000}
          required
          placeholder="Contexte, objectif, calendrier…"
        />
      </div>
      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="company">Entreprise secondaire</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <button
        className="button-primary"
        type="submit"
        disabled={!isHydrated || isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? 'Envoi en cours…' : 'Envoyer la demande ↗'}
      </button>

      <div className="form-status" aria-live="polite" aria-atomic="true">
        {state.name === 'invalid' && <p role="alert">{state.message}</p>}
        {state.name === 'complete' && state.result.status === 'sent' && (
          <p className="form-status--success">
            Merci — votre message est parti. Nous revenons vers vous rapidement.
          </p>
        )}
        {state.name === 'complete' && state.result.status === 'rejected' && (
          <p role="alert">
            La demande n’a pas pu être acceptée. Patientez quelques minutes ou
            utilisez l’email direct.
          </p>
        )}
        {state.name === 'complete' && state.result.status === 'fallback' && (
          <p role="alert">
            L’envoi automatique est indisponible. Votre message n’est pas perdu
            : envoyez-le à{' '}
            <a href="mailto:hello@ozastra.com?subject=Projet%20Ozastra">
              hello@ozastra.com
            </a>
            .
          </p>
        )}
      </div>
    </form>
  )
}
