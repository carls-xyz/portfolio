import ContactForm from '@/components/contact/ContactForm'
import { UTILISATEUR_GITHUB } from '@/lib/github'
import styles from './contact.module.css'

export const metadata = {
  title: 'Contact',
  description: 'Envoyer un message via le formulaire de contact',
}

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Contactez-moi</h1>
        <p className={styles.description}>
          Une question sur un projet ou une proposition&nbsp;: le message arrive directement dans ma boîte mail.
        </p>
        <ContactForm />
        {/* For those who would rather not fill in a form */}
        <p className={styles.ailleurs}>
          Ou sur{' '}
          <a href={`https://github.com/${UTILISATEUR_GITHUB}`} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </p>
      </div>
    </div>
  )
}