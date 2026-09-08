export type Contexte = "Projet personnel" | "Projet de cours" | "Projet d'équipe";

export type Projet = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  annee: string;
  contexte: Contexte;
  /** Ce que j'ai personnellement développé, pour les projets réalisés à plusieurs. */
  role?: string;
  stack: string[];
  points: string[];
  repoUrl?: string;
  imageUrl: string;
  aLaUne?: boolean;
};

export const projets: Projet[] = [
  {
    slug: "rag-doc-assistant",
    title: "RAG Doc Assistant",
    tagline: "Poser des questions à une documentation en langage naturel",
    description:
      "Une application web qui prend l'URL d'une documentation, la crawle, l'indexe dans une base vectorielle, puis répond aux questions en s'appuyant uniquement sur son contenu et en citant ses sources. Je l'ai construite pour comprendre concrètement, étape par étape, comment fonctionne un pipeline RAG.",
    annee: "2026",
    contexte: "Projet personnel",
    stack: ["Python", "Flask", "LangChain", "ChromaDB", "Groq", "BeautifulSoup"],
    points: [
      "Pipeline complet : crawl, nettoyage HTML, découpage en chunks, embeddings, indexation, recherche par similarité, génération",
      "Embeddings calculés en local avec all-MiniLM-L6-v2, seule la génération passe par une API externe",
      "Progression de l'indexation renvoyée en direct au navigateur via Server-Sent Events",
      "Réponses accompagnées des URLs sources, et consigne au modèle de dire quand l'information est absente",
    ],
    repoUrl: "https://github.com/carls-xyz/RAG",
    imageUrl: "/projets/rag.svg",
    aLaUne: true,
  },
  {
    slug: "assistant-email-n8n",
    title: "Assistant email n8n",
    tagline: "Un résumé de mes emails sur Telegram chaque matin",
    description:
      "Un workflow n8n qui lit chaque matin les emails reçus dans les dernières 24 heures, écarte newsletters et spams, en fait un résumé avec un LLM et me l'envoie sur Telegram. Né de l'envie d'arrêter de parcourir ma boîte mail au réveil.",
    annee: "2026",
    contexte: "Projet personnel",
    stack: ["n8n", "Gmail API", "Groq", "Telegram Bot API"],
    points: [
      "Déclenchement planifié quotidien, avec branche dédiée quand il n'y a aucun mail",
      "Filtrage des newsletters et des spams avant l'appel au modèle",
      "Résumé généré par Llama 3.3 70B via l'API Groq",
      "Aucune donnée sensible dans le fichier versionné : clés et identifiants sont des placeholders",
    ],
    repoUrl: "https://github.com/carls-xyz/n8nproject",
    imageUrl: "/projets/n8n.svg",
    aLaUne: true,
  },
  {
    slug: "parc-activites",
    title: "Parc d'activités",
    tagline: "Une application MVC en PHP, sans framework",
    description:
      "Application de gestion d'un parc de loisirs : consultation des activités, réservation de places par les utilisateurs connectés, et espace d'administration pour gérer le catalogue. Tout est écrit en PHP pur, le routeur, l'autoload, la couche d'accès aux données et le moteur de rendu sont faits à la main.",
    annee: "2025",
    contexte: "Projet de cours",
    role: "Le squelette du routeur venait du support de cours ; j'ai écrit les entités, les modèles PDO, les trois contrôleurs, l'autoload, le trait de rendu et l'ensemble des vues.",
    stack: ["PHP 8", "Programmation orientée objet", "PDO", "MySQL"],
    points: [
      "Routeur maison gérant les routes GET et POST, avec réécriture d'URL",
      "Séparation stricte entités, modèles, contrôleurs et vues",
      "Authentification par session, mots de passe hachés, actions d'administration protégées par rôle",
      "Réservation avec contrôle des places disponibles et annulation",
    ],
    repoUrl: "https://github.com/carls-xyz/IIM_A2CDI_PHPOO",
    imageUrl: "/projets/parc.svg",
    aLaUne: true,
  },
  {
    slug: "pixeltrader",
    title: "PixelTrader",
    tagline: "Catalogue de jeux rétro, du CSV brut à l'interface",
    description:
      "Projet de bootcamp en binôme : partir d'un export CSV de stock de jeux vidéo rétro, le nettoyer, l'exposer via une API REST, puis l'afficher dans une interface de consultation avec filtres et pages de détail.",
    annee: "2026",
    contexte: "Projet d'équipe",
    role: "J'ai développé l'API REST en PHP ainsi que la partie de l'interface qui la consomme : chargement des jeux, filtres, page de détail et habillage rétro gaming. Mon binôme a écrit le nettoyeur CSV et la structure HTML initiale.",
    stack: ["PHP 8", "PDO", "MySQL", "JavaScript", "Node.js"],
    points: [
      "API REST renvoyant du JSON, avec accès par identifiant et filtrage par état",
      "Interface en JavaScript natif, sans framework, qui consomme l'API",
      "Nettoyage préalable des données via un script Node",
    ],
    repoUrl: "https://github.com/carls-xyz/bootcamp",
    imageUrl: "/projets/pixeltrader.svg",
    aLaUne: true,
  },
  {
    slug: "portfolio",
    title: "Ce portfolio",
    tagline: "Next.js, App Router et formulaire de contact",
    description:
      "Le site que vous êtes en train de parcourir. Une page d'accueil, une galerie de projets avec une page de détail par projet générée par route dynamique, et un formulaire de contact qui envoie un email via Resend depuis une route API.",
    annee: "2026",
    contexte: "Projet de cours",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Resend"],
    points: [
      "App Router, avec route dynamique par projet et métadonnées générées",
      "Formulaire de contact traité côté serveur par une route API",
      "Styles en CSS Modules, complétés par Tailwind",
    ],
    repoUrl: "https://github.com/carls-xyz/portfolio",
    imageUrl: "/projets/portfolio.svg",
    aLaUne: true,
  },
  {
    slug: "crud-securise",
    title: "CRUD sécurisé",
    tagline: "Appliquer les bases de la sécurité web",
    description:
      "Une petite plateforme de gestion de musiques où seuls les administrateurs peuvent ajouter, modifier ou supprimer une entrée. L'objectif du projet était moins le CRUD que les protections qui l'entourent.",
    annee: "2026",
    contexte: "Projet d'équipe",
    role: "Projet réalisé en binôme dans le cadre du cours de sécurité web.",
    stack: ["PHP 8", "PDO", "MySQL"],
    points: [
      "Jetons anti-CSRF générés en session, vérifiés puis invalidés à chaque soumission",
      "Requêtes préparées avec paramètres nommés sur toutes les interactions avec la base",
      "Mots de passe hachés en bcrypt, vérifiés avec password_verify",
      "Échappement des entrées utilisateur avant affichage",
    ],
    repoUrl: "https://github.com/carls-xyz/crud-security",
    imageUrl: "/projets/crud.svg",
  },
  {
    slug: "gestion-classes-symfony",
    title: "Gestion de classes",
    tagline: "Évaluation Symfony en une journée",
    description:
      "Application de gestion scolaire réalisée lors d'une évaluation Symfony : des classes, et des élèves rattachés à une classe, avec les formulaires de saisie associés.",
    annee: "2025",
    contexte: "Projet d'équipe",
    role: "J'ai développé la partie « élèves » : le contrôleur, le formulaire avec sélection de la classe, et les templates Twig associés. Mes coéquipiers ont mis en place le squelette, les entités et la partie « classes ».",
    stack: ["Symfony 7", "Doctrine ORM", "Twig", "PHP 8"],
    points: [
      "Entités liées par une relation ManyToOne, gérées avec Doctrine et ses migrations",
      "Formulaire Symfony avec sélection de la classe via EntityType",
      "Docker Compose fourni pour la base de données",
    ],
    repoUrl: "https://github.com/carls-xyz/evalSymfony",
    imageUrl: "/projets/symfony.svg",
  },
  {
    slug: "emotions-project",
    title: "Emotions Project",
    tagline: "Un jeu d'ambiance en CSS pur",
    description:
      "Un petit jeu de surveillance de caméras inspiré de l'univers de Five Nights at Freddy's, réalisé pour m'entraîner sur les animations CSS et la manipulation du DOM, sans aucun framework.",
    annee: "2026",
    contexte: "Projet personnel",
    stack: ["Vite", "JavaScript", "CSS"],
    points: [
      "Effets de grain, de bruit et de coupure d'image entièrement en CSS",
      "Navigation entre plusieurs vues de caméras",
      "Aucune dépendance en dehors de Vite",
    ],
    repoUrl: "https://github.com/carls-xyz/emotions-project",
    imageUrl: "/projets/emotions.svg",
  },
];

export const projetsALaUne = projets.filter((p) => p.aLaUne);
