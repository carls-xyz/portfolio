"use client"

import { useState, useRef } from 'react'
import styles from './ContactForm.module.css'

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const formRef = useRef<HTMLFormElement>(null) 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message')
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (res.ok) {
        setMessage(' Message envoyé avec succès !')
        setMessageType('success')
        formRef.current?.reset() 
      } else {
        setMessage(`${result.error || 'Erreur'}`)
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage(' Erreur de connexion')
      setMessageType('error')
    }

    setLoading(false)
  }

  return (
    <form 
      ref={formRef} 
      className={styles.form} 
      onSubmit={handleSubmit}
    >
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Nom
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Entrez votre nom"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="votre@email.com"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Votre message..."
          required
          rows={6}
          className={styles.textarea}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className={styles.button}
      >
        {loading ? (
          <div className={styles.spinner}></div>
        ) : (
          'Envoyer'
        )}
      </button>

      {message && (
        <div className={`${styles.message} ${styles[messageType]}`}>
          {message}
        </div>
      )}
    </form>
  )
}