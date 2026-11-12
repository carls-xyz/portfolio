import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAILLE_MAX_REQUETE = 20_000;
const FENETRE_LIMITE = 10 * 60 * 1000;
const ENVOIS_MAX = 3;

type Tentatives = { debut: number; nombre: number };

// Repli borné pour le développement ; la production utilise Redis partagé.
const tentatives = new Map<string, Tentatives>();

function adresseClient(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'inconnue'
  );
}

async function verifierLimite(cle: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    // Increment and expiry must be atomic across server instances.
    const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return {n,redis.call('PTTL',KEYS[1])}";
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', script, '1', `contact:${cle}`, String(FENETRE_LIMITE)]),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('Limiteur indisponible');
    const { result } = await res.json();
    if (!Array.isArray(result) || result.length !== 2 || !result.every(Number.isFinite) || result[1] < 0) {
      throw new Error('Réponse du limiteur invalide');
    }
    return result[0] > ENVOIS_MAX ? Math.max(1, Math.ceil(result[1] / 1000)) : null;
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Limiteur partagé non configuré');
  const maintenant = Date.now();
  for (const [ip, valeur] of tentatives) {
    if (maintenant - valeur.debut >= FENETRE_LIMITE) tentatives.delete(ip);
  }
  if (!tentatives.has(cle) && tentatives.size >= 10_000) throw new Error('Limiteur saturé');
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

    const lecteur = request.body?.getReader();
    const morceaux: Uint8Array[] = [];
    let taille = 0;
    if (lecteur) {
      try {
        while (true) {
          const { done, value } = await lecteur.read();
          if (done) break;
          taille += value.byteLength;
          if (taille > TAILLE_MAX_REQUETE) {
            await lecteur.cancel();
            break;
          }
          morceaux.push(value);
        }
      } finally {
        lecteur.releaseLock();
      }
    }
    if (taille > TAILLE_MAX_REQUETE) {
      return NextResponse.json(
        { error: 'Le message est trop volumineux.' },
        { status: 413 }
      );
    }
    const contenuBrut = Buffer.concat(morceaux).toString('utf8');

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

    let attente: number | null;
    try {
      attente = await verifierLimite(adresseClient(request));
    } catch {
      return NextResponse.json(
        { error: 'Le formulaire est temporairement indisponible. Réessayez plus tard.' },
        { status: 503, headers: { 'Retry-After': '60' } }
      );
    }
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

    const resend = new Resend(process.env.RESEND_API_KEY);
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
