/*
 * Announcements for the island under the nav (Ile.tsx): anything on the site
 * can call annoncer("Message envoyé") and the island grows to show it for a
 * moment. It only echoes what the page already says, so it stays out of the
 * accessibility tree.
 */

export function annoncer(texte: string) {
  window.dispatchEvent(new CustomEvent('ile', { detail: texte }))
}
