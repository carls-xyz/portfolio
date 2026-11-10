"use client"

import { useState, useRef } from 'react'
import BestioleJoie from '@/components/accueil/BestioleJoie'
import { annoncer } from '@/components/layout/annonces'
import styles from './ContactForm.module.css'

type Champ = 'name' | 'email' | 'message'
type Erreurs = Partial<Record<Champ, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function valider(data: Record<Champ, string>): Erreurs {
  const erreurs: Erreurs = {}
  if (!data.name.trim()) erreurs.name = 'Indiquez votre nom'
  else if (data.name.trim().length < 2) erreurs.name = 'Le nom doit contenir au moins 2 caractères'
  else if (data.name.trim().length > 80) erreurs.name = 'Le nom ne peut pas dépasser 80 caractères'
  if (!data.email.trim()) erreurs.email = 'Indiquez votre adresse email'
  else if (!EMAIL.test(data.email.trim())) erreurs.email = 'Adresse invalide, par exemple nom@domaine.fr'
  else if (data.email.trim().length > 254) erreurs.email = 'L’adresse email est trop longue'
  if (!data.message.trim()) erreurs.message = 'Écrivez votre message'
  else if (data.message.trim().length < 10) erreurs.message = 'Le message doit contenir au moins 10 caractères'
  else if (data.message.trim().length > 5_000) erreurs.message = 'Le message ne peut pas dépasser 5 000 caractères'
  return erreurs
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [erreurs, setErreurs] = useState<Erreurs>({})
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      message: String(formData.get('message') ?? ''),
    }

    const website = String(formData.get('website') ?? '')

    // Each error is shown under its field, and focus goes to the first one
    const trouvees = valider(data)
    setErreurs(trouvees)
    const premier = (Object.keys(trouvees) as Champ[])[0]
    if (premier) {
      formRef.current?.querySelector<HTMLElement>(`#${premier}`)?.focus()
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, website })
      })

      const result = await res.json()

      if (res.ok) {
        setMessage('Message envoyé')
        annoncer('Message envoyé')
        setMessageType('success')
        formRef.current?.reset()
      } else {
        setMessage(result.error || 'Le message n’a pas pu être envoyé')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage('Connexion impossible, le message n’a pas été envoyé')
      setMessageType('error')
    }

    setLoading(false)
  }

  const champ = (id: Champ) => ({
    id,
    name: id,
    'aria-invalid': erreurs[id] ? true : undefined,
    'aria-describedby': erreurs[id] ? `${id}-erreur` : undefined,
  })

  const erreur = (id: Champ) =>
    erreurs[id] && (
      <p id={`${id}-erreur`} className={styles.fieldError}>
        {erreurs[id]}
      </p>
    )

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Nom
        </label>
        <input
          type="text"
          autoComplete="name"
          maxLength={80}
          className={styles.input}
          {...champ('name')}
        />
        {erreur('name')}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          type="email"
          placeholder="nom@domaine.fr"
          autoComplete="email"
          maxLength={254}
          className={styles.input}
          {...champ('email')}
        />
        {erreur('email')}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>
          Message
        </label>
        <textarea
          rows={6}
          maxLength={5000}
          className={styles.textarea}
          {...champ('message')}
        />
        {erreur('message')}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={styles.button}
      >
        {loading ? (
          <div className={styles.spinner} aria-label="Envoi en cours"></div>
        ) : (
          'Envoyer'
        )}
      </button>

      <div role="status">
        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {messageType === 'success' && <BestioleJoie />}
            {message}
          </div>
        )}
      </div>
    </form>
  )
}
