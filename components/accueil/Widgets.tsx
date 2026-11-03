"use client"

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { GripHorizontal } from 'lucide-react'
import { annoncer } from '@/components/layout/annonces'
import styles from './Widgets.module.css'

/*
 * The home page's widgets (clock, creature, weather, GitHub activity), which visitors
 * can rearrange: a grip appears on hover; drag it and the other widgets slide
 * out of the way. The dragged widget is magnetic: it stays held by its place,
 * leaning towards the pointer with growing resistance, and snaps (with a
 * little bounce) into a new place as soon as the pointer reaches one.
 *
 * The places have fixed sizes, not the widgets: wide, narrow / narrow, wide
 * (EMPLACEMENTS). A widget takes the size of the place it is dropped in, so
 * the grid is always two full rows, like a phone's home screen. From the keyboard, focus the grip and use the arrow keys.
 * The order is saved in this browser only, and can be put back.
 */

export type Widget = { id: string; titre: string; contenu: ReactNode }

/** Columns spanned by each place, in reading order: a wide one and a narrow one per row */
const EMPLACEMENTS = [2, 1, 1, 2]

const CLE = 'widgets'
function abonner(rappel: () => void) {
  window.addEventListener('widgets', rappel)
  window.addEventListener('storage', rappel)
  return () => {
    window.removeEventListener('widgets', rappel)
    window.removeEventListener('storage', rappel)
  }
}
const lireStockage = () => {
  try {
    return localStorage.getItem(CLE) ?? ''
  } catch {
    return ''
  }
}

/** The saved order if it still matches the widgets on the page, else the default one */
function ordreDepuis(brut: string, parDefaut: string[]) {
  try {
    const o = JSON.parse(brut)
    if (Array.isArray(o) && o.length === parDefaut.length && parDefaut.every(id => o.includes(id))) return o as string[]
  } catch {}
  return parDefaut
}

function enregistrer(ordre: string[] | null) {
  try {
    if (ordre) localStorage.setItem(CLE, JSON.stringify(ordre))
    else localStorage.removeItem(CLE)
  } catch {}
  window.dispatchEvent(new Event('widgets'))
}

const calme = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Where a widget sits in the layout, ignoring any transform (its slide animation, or the drag) */
function emplacement(el: HTMLElement) {
  const parent = (el.offsetParent as HTMLElement | null)?.getBoundingClientRect() ?? { left: 0, top: 0 }
  const left = parent.left + el.offsetLeft
  const top = parent.top + el.offsetTop
  return { left, top, right: left + el.offsetWidth, bottom: top + el.offsetHeight }
}

/* After a swap, the next one waits a moment and needs the pointer to have moved on:
   otherwise widgets of different sizes keep trading places under a still pointer */
const REPOS_MS = 280
const DISTANCE_MIN = 32

/** How far the widget follows the pointer from its place: freely at first, then held back */
const aimant = (d: number) => Math.sign(d) * (Math.abs(d) < 24 ? Math.abs(d) * 0.6 : 14.4 + (Math.abs(d) - 24) * 0.22)
const GLISSE = 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)'
const COLLE = 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)'

export default function Widgets({ widgets }: { widgets: Widget[] }) {
  const parDefaut = widgets.map(w => w.id)
  const brut = useSyncExternalStore(abonner, lireStockage, () => '')
  const ordre = ordreDepuis(brut, parDefaut)
  const personnalise = ordre.join() !== parDefaut.join()

  const elements = useRef(new Map<string, HTMLDivElement>())
  const poignees = useRef(new Map<string, HTMLButtonElement>())
  const [tire, setTire] = useState<string | null>(null)
  const [retour, setRetour] = useState<string | null>(null) // just dropped, still settling
  const prise = useRef({ id: '', dx: 0, dy: 0, deplace: false })
  // The widget just swapped with stays off-limits until the pointer has left its place
  const dernierEchange = useRef({ t: 0, x: 0, y: 0, avec: '' })

  /** Moves a widget to a new place; the others glide from where they were (FLIP) */
  const placer = (id: string, vers: number) => {
    const actuel = ordreDepuis(lireStockage(), parDefaut)
    if (actuel.indexOf(id) === vers) return
    const avant = new Map([...elements.current].map(([k, el]) => [k, el.getBoundingClientRect()]))
    const suivant = actuel.filter(x => x !== id)
    suivant.splice(vers, 0, id)
    flushSync(() => enregistrer(suivant))
    if (calme()) return
    elements.current.forEach((el, k) => {
      const a = avant.get(k)
      if (!a || k === prise.current.id) return
      const b = el.getBoundingClientRect()
      const dx = a.left - b.left
      const dy = a.top - b.top
      if (dx || dy)
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
          duration: 320,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        })
    })
  }

  /** Leans the dragged widget towards the pointer, held back by its place */
  const suivrePointeur = (el: HTMLDivElement, x: number, y: number) => {
    const place = emplacement(el)
    const dx = x - place.left - prise.current.dx
    const dy = y - place.top - prise.current.dy
    el.style.transform = `translate(${aimant(dx)}px, ${aimant(dy)}px) scale(1.02)`
  }

  /** After a swap: start from where the widget was on screen, then snap to its new place */
  const coller = (el: HTMLDivElement, visible: DOMRect, x: number, y: number) => {
    if (calme()) return suivrePointeur(el, x, y)
    const place = emplacement(el)
    el.style.transition = 'none'
    el.style.transform = `translate(${visible.left - place.left}px, ${visible.top - place.top}px) scale(1.02)`
    void el.offsetWidth // commit that position before animating away from it
    el.style.transition = COLLE
    suivrePointeur(el, x, y)
    window.setTimeout(() => {
      if (prise.current.id) el.style.transition = GLISSE
    }, 420)
  }

  /*
   * The drag is followed on the window, not through pointer capture: reordering
   * moves the widget's node in the page, and browsers drop the capture when
   * that happens, which would leave the widget stuck mid-air on release.
   */
  const saisir = (id: string) => (e: PointerEvent<HTMLButtonElement>) => {
    const el = elements.current.get(id)
    if (!el || prise.current.id || (e.pointerType === 'mouse' && e.button !== 0)) return
    e.preventDefault()
    const pointeur = e.pointerId
    const bouge = (ev: globalThis.PointerEvent) =>
      ev.pointerId === pointeur && glisser(id, ev.clientX, ev.clientY, ev.timeStamp)
    const fin = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointeur) return
      window.removeEventListener('pointermove', bouge)
      window.removeEventListener('pointerup', fin)
      window.removeEventListener('pointercancel', fin)
      lacher(id)
    }
    window.addEventListener('pointermove', bouge)
    window.addEventListener('pointerup', fin)
    window.addEventListener('pointercancel', fin)
    const r = el.getBoundingClientRect()
    prise.current = { id, dx: e.clientX - r.left, dy: e.clientY - r.top, deplace: false }
    dernierEchange.current = { t: 0, x: e.clientX, y: e.clientY, avec: '' }
    el.style.transition = calme() ? 'none' : GLISSE
    setTire(id)
  }

  /** `t` is the event's timestamp, on the same clock as performance.now() */
  const glisser = (id: string, x: number, y: number, t: number) => {
    if (prise.current.id !== id) return
    const el = elements.current.get(id)
    if (!el) return
    suivrePointeur(el, x, y)

    const d = dernierEchange.current
    const dedans = (r: ReturnType<typeof emplacement>) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    const precedent = d.avec && elements.current.get(d.avec)
    if (precedent && !dedans(emplacement(precedent))) d.avec = ''
    if (t - d.t < REPOS_MS) return
    if (d.t && Math.hypot(x - d.x, y - d.y) < DISTANCE_MIN) return

    // Over another widget's place: take it
    const actuel = ordreDepuis(lireStockage(), parDefaut)
    for (const [k, autre] of elements.current) {
      if (k === id || k === d.avec) continue
      if (dedans(emplacement(autre))) {
        const visible = el.getBoundingClientRect()
        placer(id, actuel.indexOf(k))
        prise.current.deplace = true
        dernierEchange.current = { t, x, y, avec: k }
        coller(el, visible, x, y)
        break
      }
    }
  }

  const lacher = (id: string) => {
    if (prise.current.id !== id) return
    const el = elements.current.get(id)
    prise.current.id = ''
    setTire(null)
    if (!el) return
    // Released: it snaps back into its place with a little bounce, still above the others
    setRetour(id)
    el.style.transition = calme() ? 'none' : COLLE
    el.style.transform = ''
    window.setTimeout(() => {
      if (prise.current.id !== id) el.style.transition = ''
      setRetour(r => (r === id ? null : r))
    }, 450)
    if (prise.current.deplace) annoncer('Widgets réorganisés')
  }

  // Keyboard: arrows move the focused widget one place, focus stays on its grip
  const clavier = (id: string, titre: string) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const pas = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : 0
    if (!pas) return
    e.preventDefault()
    const actuel = ordreDepuis(lireStockage(), parDefaut)
    const vers = actuel.indexOf(id) + pas
    if (vers < 0 || vers >= actuel.length) return
    placer(id, vers)
    poignees.current.get(id)?.focus()
    annoncer(`${titre} : place ${vers + 1} sur ${actuel.length}`)
  }

  return (
    <>
      <div className={styles.widgets}>
        {ordre.map((id, place) => {
          const w = widgets.find(x => x.id === id)
          if (!w) return null
          return (
            <div
              key={id}
              ref={el => {
                if (el) elements.current.set(id, el)
                else elements.current.delete(id)
              }}
              className={styles.widget}
              data-colonnes={EMPLACEMENTS[place] ?? 1}
              data-tire={tire === id || undefined}
              data-retour={retour === id || undefined}
            >
              <button
                ref={el => {
                  if (el) poignees.current.set(id, el)
                  else poignees.current.delete(id)
                }}
                type="button"
                className={styles.poignee}
                aria-label={`Déplacer le widget ${w.titre} (flèches pour changer sa place)`}
                onPointerDown={saisir(id)}
                onKeyDown={clavier(id, w.titre)}
              >
                <GripHorizontal size={14} aria-hidden="true" />
              </button>
              <div className={styles.contenu}>{w.contenu}</div>
            </div>
          )
        })}
      </div>
      {personnalise && (
        <p className={styles.remettre}>
          <button type="button" onClick={() => enregistrer(null)}>
            Remettre les widgets dans leur ordre
          </button>
        </p>
      )}
    </>
  )
}
