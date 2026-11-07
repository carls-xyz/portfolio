import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAILLE_MAX_REQUETE = 20_000;
const FENETRE_LIMITE = 10 * 60 * 1000;
const ENVOIS_MAX = 3;

type Tentatives = { debut: number; nombre: number };

// Limitation simple, par instance du serveur. Elle évite les rafales accidentelles
// et complète le quota du fournisseur d'email sans nécessiter de base externe.
const tentatives = new Map<string, Tentatives>();

function adresseClient(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'inconnue'
  );
}

function verifierLimite(cle: string) {
  const maintenant = Date.now();
  const entree = tentatives.get(cle);

  if (!entree || maintenant - entree.debut >= FENETRE_LIMITE) {
    tentatives.set(cle, { debut: maintenant, nombre: 1 });
    return null;
  }

  if (entree.nombre >= ENVOIS_MAX) {
    return Math.ceil((FENETRE_LIMITE - (maintenant - entree.debut)) / 1000);
  }

  entree.nombre += 1;
  return null;
}

/** Neutralise le HTML saisi par le visiteur avant de l'insérer dans l'email. */
function echapper(valeur: string) {
  return valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
    console.error(
      'Configuration manquante : RESEND_API_KEY et CONTACT_EMAIL doivent être définies.'
    );
    return NextResponse.json(
      { error: "Le formulaire de contact n'est pas configuré." },
      { status: 500 }
    );
  }

  try {
    const tailleAnnoncee = Number(request.headers.get('content-length') ?? 0);
    if (tailleAnnoncee > TAILLE_MAX_REQUETE) {
      return NextResponse.json(
        { error: 'Le message est trop volumineux.' },
        { status: 413 }
      );
    }

    const contenuBrut = await request.text();
    if (contenuBrut.length > TAILLE_MAX_REQUETE) {
      return NextResponse.json(
        { error: 'Le message est trop volumineux.' },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(contenuBrut);
    } catch {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    const { name, email, message, website } = body as Record<string, unknown>;

    // Champ invisible pour les visiteurs : les robots qui le remplissent reçoivent
    // une réponse positive, mais aucun email n'est envoyé.
    if (typeof website === 'string' && website.trim()) {
      return NextResponse.json({ success: true });
    }

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Données invalides.' },
        { status: 400 }
      );
    }

    const nameNettoye = name.trim();
    const emailNettoye = email.trim();
    const messageNettoye = message.trim();

    if (
      nameNettoye.length < 2 ||
      nameNettoye.length > 80 ||
      emailNettoye.length > 254 ||
      !EMAIL.test(emailNettoye) ||
      messageNettoye.length < 10 ||
      messageNettoye.length > 5_000
    ) {
      return NextResponse.json(
        { error: 'Vérifiez les champs du formulaire.' },
        { status: 400 }
      );
    }

    const attente = verifierLimite(adresseClient(request));
    if (attente !== null) {
      return NextResponse.json(
        { error: 'Trop de messages envoyés. Réessayez dans quelques minutes.' },
        { status: 429, headers: { 'Retry-After': String(attente) } }
      );
    }

    const nom = echapper(nameNettoye);
    const expediteur = echapper(emailNettoye);
    const contenu = echapper(messageNettoye);
    const sujet = nameNettoye.replace(/[\r\n]+/g, ' ');

    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM ?? 'Portfolio <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL],
      replyTo: emailNettoye,
      subject: `Nouveau message de ${sujet}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #1a4a91;">Nouveau message depuis ton portfolio</h2>

          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom :</strong> ${nom}</p>
            <p><strong>Email :</strong> ${expediteur}</p>
          </div>

          <div style="margin: 20px 0;">
            <p style="font-weight: bold;">Message :</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #1a4a91;">
              <p style="white-space: pre-wrap;">${contenu}</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json(
        { error: "Le message n'a pas pu être envoyé. Réessayez plus tard." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: "Le message n'a pas pu être envoyé. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
