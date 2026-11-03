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
  if (!data.email.trim()) erreurs.email = 'Indiquez votre adresse email'
  else if (!EMAIL.test(data.email.trim())) erreurs.email = 'Adresse invalide, par exemple nom@domaine.fr'
  if (!data.message.trim()) erreurs.message = 'Écrivez votre message'
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
        body: JSON.stringify(data)
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
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Nom
        </label>
        <input
          type="text"
          placeholder="Entrez votre nom"
          autoComplete="name"
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
          placeholder="votre@email.com"
          autoComplete="email"
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
          placeholder="Votre message..."
          rows={6}
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
