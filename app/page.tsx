import Link from "next/link";
import "@/app/globals.css";
import ProjetsCard from "@/components/projets/ProjetsCard";
import { projets, projetsALaUne } from "@/data/projets";
import styles from "./projets/projets.module.css";

export const metadata = {
  title: "Mon Portfolio",
  description:
    "Portfolio de Charles Bauchet, étudiant développeur web à l'IIM. Projets en PHP, Symfony, Next.js et Python.",
};

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Charles Bauchet</h1>

      <p className={styles.description}>
        Étudiant en 3<sup>e</sup> année de Coding &amp; Digital Innovation à l&apos;IIM.
        Je développe surtout en PHP et Symfony côté serveur, en Next.js et TypeScript
        côté client, et j&apos;explore l&apos;usage des LLM dans des applications concrètes.
      </p>

      <div className={styles.grid}>
        {projetsALaUne.map(projet => (
          <ProjetsCard key={projet.slug} projet={projet} />
        ))}
      </div>

      <div className={styles.actions}>
        <Link href="/projets" className={styles.lien}>
          Voir les {projets.length} projets →
        </Link>
      </div>
    </div>
  );
}
