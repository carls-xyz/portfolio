import { createHmac, timingSafeEqual } from 'node:crypto'
import { after, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { TAG_GITHUB } from '@/lib/github'

/*
 * GitHub webhook: on every push (or merged pull request) to one of my
 * repositories, the GitHub activity card is refreshed right away instead of
 * waiting for its quarter-hour cache. GitHub signs each delivery with the
 * shared secret (GITHUB_WEBHOOK_SECRET); anything unsigned or wrongly signed
 * is refused, so nobody else can force the site to refetch.
 *
 * GitHub recounts contributions a little after a push, so the card is
 * refreshed a second time a minute later.
 */

export const maxDuration = 90

const RELIRE_APRES_MS = 60_000

function signatureValide(corps: string, signature: string | null, secret: string): boolean {
  if (!signature?.startsWith('sha256=')) return false
  const attendue = Buffer.from(`sha256=${createHmac('sha256', secret).update(corps).digest('hex')}`)
  const recue = Buffer.from(signature)
  return attendue.length === recue.length && timingSafeEqual(attendue, recue)
}

function rafraichir() {
  revalidateTag(TAG_GITHUB, { expire: 0 })
  revalidatePath('/')
}

export async function POST(requete: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ erreur: 'Webhook non configuré' }, { status: 503 })

  const corps = await requete.text()
  if (!signatureValide(corps, requete.headers.get('x-hub-signature-256'), secret)) {
    return NextResponse.json({ erreur: 'Signature invalide' }, { status: 401 })
  }

  const evenement = requete.headers.get('x-github-event')
  // « ping » arrives once when the webhook is created: it only checks the secret.
  if (evenement === 'ping') return NextResponse.json({ ok: true, ping: true })

  let charge: { action?: string; pull_request?: { merged?: boolean } } = {}
  try {
    charge = JSON.parse(corps)
  } catch {
    return NextResponse.json({ erreur: 'Contenu illisible' }, { status: 400 })
  }
  const compte = evenement === 'push' || (evenement === 'pull_request' && charge.action === 'closed' && charge.pull_request?.merged === true)
  if (!compte) return NextResponse.json({ ok: true, ignore: evenement })

  rafraichir()
  after(async () => {
    await new Promise(r => setTimeout(r, RELIRE_APRES_MS))
    rafraichir()
  })
  return NextResponse.json({ ok: true, rafraichi: true })
}
