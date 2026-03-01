import ContactForm from '@/components/contact/ContactForm'
import styles from './contact.module.css'

export const metadata = {
  title: 'Contact',
  description: 'Contactez moi pour discuter de vos projets',
}

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Contactez-moi</h1>
        <p className={styles.description}>
          Une question ? N'hésitez pas à me contacter.
        </p>
        <ContactForm />
      </div>
    </div>
  )
}