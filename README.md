# Portfolio

Mon portfolio personnel : une page d'accueil, une galerie de projets avec une page de détail par projet, et un formulaire de contact qui envoie un mail via Resend.

Projet réalisé dans le cadre de mes études à l'IIM, puis repris pour mon usage personnel.

## Fonctionnalités

- Page d'accueil de présentation
- Liste des projets, alimentée par un fichier de données typé (`data/projets.ts`)
- Page de détail par projet, générée par route dynamique (`/projets/[slug]`)
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

Les projets sont déclarés dans `data/projets.ts`. Chaque entrée a un `slug`, un `title`, une `description` et une `imageUrl` ; le slug sert d'URL sur la page de détail.

## À faire

- Remplacer les images d'illustration par de vraies captures des projets
- Compléter la liste avec les projets manquants
- Déployer le site et ajouter le lien ici
