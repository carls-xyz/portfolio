import Link from "next/link";
import "@/app/globals.css";
import IciEtMaintenant from "@/components/accueil/IciEtMaintenant";
import Bestiole from "@/components/accueil/Bestiole";
import ActiviteGitHub from "@/components/accueil/ActiviteGitHub";
import Widgets from "@/components/accueil/Widgets";
import Meteo from "@/components/accueil/Meteo";
import DefilementAuto from "@/components/accueil/DefilementAuto";
import Cover from "@/components/projets/Cover";
import { projets } from "@/data/projets";
import styles from "./projets/projets.module.css";

export const metadata = {
  title: { absolute: "carls-xyz" },
  description:
    "Portfolio de développeur web : projets en PHP, Symfony, Next.js et Python.",
};

export default function Home() {
  return (
    <div className={styles.container}>
      {/* The site's name for screen readers and search; on screen each section has its own title */}
      <h1 className="sr-only">carls-xyz</h1>

      {/* Every project at a glance: each tile plays its cover's gesture on hover */}
      <nav className={styles.bande} aria-labelledby="titre-projets">
        <h2 id="titre-projets" className={styles.titreSection}>
          Mes projets
        </h2>
        {/* On small screens the tiles become a swipeable row that drifts on its own */}
        <DefilementAuto className={styles.bandeListe}>
          {projets.map((projet) => (
            <li key={projet.slug}>
              <Link href={`/projets/${projet.slug}`} className={styles.tuile} data-projet={projet.slug}>
                <Cover slug={projet.slug} className={styles.tuileCover} />
                <span className={styles.tuileTitre}>{projet.title}</span>
              </Link>
            </li>
          ))}
        </DefilementAuto>
      </nav>

      {/* Where I am and the time there, the creature at its desk, the weather, GitHub activity: visitors can rearrange them */}
      <h2 className={`${styles.titreSection} ${styles.titreWidgets}`}>Tableau de bord</h2>
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
