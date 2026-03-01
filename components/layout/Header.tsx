import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      
      <nav className={styles.nav}>

        
        <ul className={styles.menu}>
          <li>
            <Link href="/" className={styles.link}>
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/projets" className={styles.link}>
              Projets
            </Link>
          </li>
          <li>
            <Link href="/contact" className={styles.link}>
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}