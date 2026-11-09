/*
 * Tests of the contact form's API route (app/api/contact/route.ts), run by
 * Node's own test runner: `npm test`. No email ever leaves: the network is
 * replaced by a fake that records what Resend would have received.
 */
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { beforeEach, test } from 'node:test'

// Outside Next.js, Node needs the file's extension to find 'next/server'
registerHooks({
  resolve: (specifier, context, next) => next(specifier === 'next/server' ? 'next/server.js' : specifier, context),
})

process.env.RESEND_API_KEY = 're_test_fausse_cle'
process.env.CONTACT_EMAIL = 'destinataire@example.com'

type Envoi = { subject: string; html: string; to: string[]; reply_to: string }
let envois: Envoi[] = []

globalThis.fetch = async (_url, init) => {
  envois.push(JSON.parse(String(init?.body)))
  return new Response(JSON.stringify({ id: 'test' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

const { POST } = await import('../app/api/contact/route.ts')

const VALIDE = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Bonjour, voici un message de test.' }

// Each test posts from its own address, so the rate limit of one never touches another
let adresse = 0
function requete(corps: unknown, ip = `10.0.0.${++adresse}`) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof corps === 'string' ? corps : JSON.stringify(corps),
  })
}

beforeEach(() => {
  envois = []
})

test('a valid message is sent once, to the configured address', async () => {
  const res = await POST(requete(VALIDE))
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { success: true })
  assert.equal(envois.length, 1)
  assert.deepEqual(envois[0].to, ['destinataire@example.com'])
  assert.equal(envois[0].reply_to, 'ada@example.com')
})

test('HTML typed by the visitor is escaped in the email', async () => {
  await POST(requete({ ...VALIDE, message: '<script>alert("x")</script> et la suite' }))
  assert.equal(envois.length, 1)
  assert.ok(!envois[0].html.includes('<script>'))
  assert.ok(envois[0].html.includes('&lt;script&gt;'))
})

test('a line break in the name cannot add a header to the subject', async () => {
  await POST(requete({ ...VALIDE, name: 'Ada\r\nBcc: autre@example.com' }))
  assert.equal(envois.length, 1)
  assert.ok(!/[\r\n]/.test(envois[0].subject))
})

test('a body that is not JSON is refused', async () => {
  const res = await POST(requete('pas du json'))
  assert.equal(res.status, 400)
  assert.equal(envois.length, 0)
})

test('missing or wrongly typed fields are refused', async () => {
  for (const corps of [{}, [], null, { ...VALIDE, email: 42 }, { name: 'Ada', email: 'ada@example.com' }]) {
    const res = await POST(requete(corps))
    assert.equal(res.status, 400)
  }
  assert.equal(envois.length, 0)
})

test('fields outside their limits are refused', async () => {
  const cas = [
    { ...VALIDE, name: 'A' },
    { ...VALIDE, name: 'A'.repeat(81) },
    { ...VALIDE, email: 'pas-un-email' },
    { ...VALIDE, message: 'court' },
    { ...VALIDE, message: 'x'.repeat(5001) },
  ]
  for (const corps of cas) {
    const res = await POST(requete(corps))
    assert.equal(res.status, 400)
  }
  assert.equal(envois.length, 0)
})

test('a request that is too large is refused', async () => {
  const res = await POST(requete({ ...VALIDE, message: 'x'.repeat(25_000) }))
  assert.equal(res.status, 413)
  assert.equal(envois.length, 0)
})

test('a robot that fills the hidden field gets a success, and no email leaves', async () => {
  const res = await POST(requete({ ...VALIDE, website: 'https://spam.example' }))
  assert.equal(res.status, 200)
  assert.equal(envois.length, 0)
})

test('the fourth message from one address within ten minutes is refused', async () => {
  const ip = '10.9.9.9'
  for (let i = 0; i < 3; i++) assert.equal((await POST(requete(VALIDE, ip))).status, 200)
  const res = await POST(requete(VALIDE, ip))
  assert.equal(res.status, 429)
  assert.ok(Number(res.headers.get('retry-after')) > 0)
  assert.equal(envois.length, 3)
})

test('without its configuration the route answers 500 and sends nothing', async () => {
  const cle = process.env.CONTACT_EMAIL
  delete process.env.CONTACT_EMAIL
  try {
    const res = await POST(requete(VALIDE))
    assert.equal(res.status, 500)
    assert.equal(envois.length, 0)
  } finally {
    process.env.CONTACT_EMAIL = cle
  }
})
