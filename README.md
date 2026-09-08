# Portfolio

Mon portfolio personnel : une page d'accueil, une galerie de projets avec une page de détail par projet, et un formulaire de contact qui envoie un mail via Resend.

Projet réalisé dans le cadre de mes études à l'IIM, puis repris pour mon usage personnel.

## Fonctionnalités

- Page d'accueil de présentation
- Liste des projets, alimentée par un fichier de données typé (`data/projets.ts`), séparée en projets personnels et projets de cours ou d'équipe
- Page de détail par projet, prégénérée en statique via `generateStaticParams` : contexte, points techniques, contribution personnelle sur les projets de groupe, technologies et lien vers le dépôt
- Formulaire de contact avec envoi d'email via Resend, traité par une route API Next.js
- Page 404 personnalisée
- Styles en CSS Modules, complétés par Tailwind CSS

## Stack

- **Next.js 16** avec l'App Router
- **React 19** et **TypeScript**
- **Tailwind CSS 4** et CSS Modules
- **Resend** pour l'envoi des emails de contact
- **lucide-react** pour les icônes
- ESLint

## Structure

```
app/
├── page.tsx              # Accueil
├── projets/
│   ├── page.tsx          # Liste des projets
│   └── [slug]/page.tsx   # Détail d'un projet
├── contact/page.tsx      # Formulaire de contact
├── api/contact/route.ts  # Route API : envoi via Resend
└── not-found.tsx         # Page 404
components/
├── layout/               # Header, Footer
├── projets/              # Carte projet
└── contact/              # Formulaire et template d'email
data/projets.ts           # Contenu des projets
```

## Lancer en local

```bash
git clone https://github.com/carls-xyz/portfolio.git
cd portfolio

npm install

# Le formulaire de contact a besoin d'une clé Resend
echo 'RESEND_API_KEY=re_ta_cle' > .env.local

npm run dev
```

Le site est disponible sur http://localhost:3000

Sans clé Resend, le site fonctionne mais l'envoi du formulaire de contact échoue.

## Ajouter un projet

Les projets sont déclarés dans `data/projets.ts`, typés par `Projet`. Chaque entrée porte un `slug` qui sert d'URL, un titre, une accroche, une description, l'année, le contexte (personnel, cours ou équipe), la liste des technologies, les points techniques à retenir, l'illustration et éventuellement l'URL du dépôt.

Le champ `role` sert aux projets réalisés à plusieurs : il décrit ce que j'y ai personnellement développé, et n'apparaît sur la page de détail que s'il est renseigné.

`aLaUne: true` fait remonter le projet sur la page d'accueil.

Les illustrations sont des visuels SVG abstraits stockés dans `public/projets/`, un par projet, déclinés dans la palette du site. C'est un choix assumé plutôt que des captures d'écran : le rendu reste neutre et homogène d'un projet à l'autre. Pour en ajouter un, reprendre le format des fichiers existants (600×340, dégradé sombre, teinte propre au projet).

## À faire

- Déployer le site et ajouter le lien ici
