import Image from "next/image";
import Header from "@/components/layout/Header";
import "@/app/globals.css";
import ProjetsCard from "@/components/projets/ProjetsCard";
import { projets } from "@/data/projets";

export const metadata = {
  title: "Mon Portfolio",
  description: "Bienvenue sur mon portfolio, découvrez mes projets et compétences en développement web.",
};

export default function Home() {
  return (
    <div className="hero-section">
      <div className="content">
        <h1 className="title">Bienvenue sur mon Portfolio</h1>

        <div className="container">
          <p className="presentation"> Etudiant en 2ème année en Coding & Digital Innovation à l'IIM vous découvrez ici mes projets et compétences en développement web.
          </p>
<div className="grid">
        {projets.map(projets => (
          <ProjetsCard
            key={projets.slug}
            projets={projets}
          />
        ))}
      </div>
          </div>
        </div>
      </div>
  );
}