import Link from 'next/link';
import BestiolePerdue from '@/components/accueil/BestiolePerdue';
import styles from './not-found.module.css';

export const metadata = {
  title: "Page introuvable",
  description: "Cette page n'existe pas.",
}

export default function NotFound() {
  return (
    <div className={styles.container}>
      {/* The creature from the home page, searching the dark for the page with its torch */}
      <div className={styles.ecran}>
        <BestiolePerdue />
      </div>
      <h1 className={styles.title}>404</h1>
      <p className={styles.subtitle}>Page introuvable</p>
      <p className={styles.text}>
        L&apos;adresse est peut-être mal saisie, ou la page a été déplacée.
      </p>
      <Link
        href="/"
        className={styles.link}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}   