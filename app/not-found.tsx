import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
}

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.subtitle}>Page not found</p>
      <p className={styles.text}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className={styles.link}
      >
        Go to Homepage
      </Link>
    </div>
  );
}   