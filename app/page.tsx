import Link from "next/link";
import "@/app/globals.css";
import IciEtMaintenant from "@/components/accueil/IciEtMaintenant";
import Bestiole from "@/components/accueil/Bestiole";
import ActiviteGitHub from "@/components/accueil/ActiviteGitHub";
import Widgets from "@/components/accueil/Widgets";
import Meteo from "@/components/accueil/Meteo";
import Cover from "@/components/projets/Cover";
import { projets } from "@/data/projets";
import styles from "./projets/projets.module.css";

export const metadata = {
  title: { absolute: "carls-xyz" },
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

      {/* Every project at a glance: each tile plays its cover's gesture on hover */}
      <nav className={styles.bande} aria-label="Tous les projets">
        <ul className={styles.bandeListe}>
          {projets.map((projet) => (
            <li key={projet.slug}>
              <Link href={`/projets/${projet.slug}`} className={styles.tuile} data-projet={projet.slug}>
                <Cover slug={projet.slug} className={styles.tuileCover} />
                <span className={styles.tuileTitre}>{projet.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Where I am and the time there, the creature at its desk, the weather, GitHub activity: visitors can rearrange them */}
      <Widgets
        widgets={[
          { id: "heure", titre: "Heure à Paris", contenu: <IciEtMaintenant /> },
          { id: "bestiole", titre: "Bestiole", contenu: <Bestiole /> },
          { id: "meteo", titre: "Météo à Paris", contenu: <Meteo /> },
          { id: "github", titre: "Activité GitHub", contenu: <ActiviteGitHub /> },
        ]}
      />

      <div className={styles.actions}>
        <Link href="/projets" className={styles.lienMetal}>
          Voir les {projets.length} projets →
        </Link>
      </div>
    </div>
  );
}
