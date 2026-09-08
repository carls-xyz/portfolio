import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const nom = echapper(String(name));
    const expediteur = echapper(String(email));
    const contenu = echapper(String(message));

    const { data, error } = await resend.emails.send({
      from: process.env.CONTACT_FROM ?? 'Portfolio <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL],
      replyTo: String(email),
      subject: `Nouveau message de ${nom}`,
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi" },
      { status: 500 }
    );
  }
}
