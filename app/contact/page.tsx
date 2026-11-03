import ContactForm from '@/components/contact/ContactForm'
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
          Une question sur un projet ou une proposition : le message arrive directement dans ma boîte mail.
        </p>
        <ContactForm />
      </div>
    </div>
  )
}