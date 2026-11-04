"use client"

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { ArrowUpRight, Bug, CornerDownLeft, FolderOpen, House, Search, SlidersHorizontal } from 'lucide-react'
import { envoyerOrdre, type Ordre } from '@/components/accueil/bestioleOrdres'
import { annoncer } from './annonces'
import { projets } from '@/data/projets'
import { useVerre } from './verre'
import styles from './Palette.module.css'

/*
 * Command palette, opened with ⌘K / Ctrl+K or the button in the nav. Type to
 * filter pages, projects (also by technology) and links; arrows to move,
 * Enter to open, Escape to close. Built on <dialog>, which keeps focus inside.
 * A few hidden commands for the creature on the home page only show up when
 * one of their exact words is typed ("café", "dodo", "saute").
 */

type Commande = {
  id: string
  groupe: 'Pages' | 'Projets' | 'Liens' | 'Bestiole' | 'Réglages'
  label: string
  detail?: string
  /** Extra words that match without being shown, e.g. a project's stack */
  motsCles?: string
  href: string
  externe?: boolean
  /** Hidden commands: an order for the creature, shown only for these exact words */
  ordre?: Ordre
  secrets?: string[]
  /** Opens a panel instead of a page, via a window event */
  evenement?: string
}

const COMMANDES: Commande[] = [
  { id: 'accueil', groupe: 'Pages', label: 'Accueil', href: '/' },
  { id: 'projets', groupe: 'Pages', label: 'Tous les projets', href: '/projets' },
  { id: 'contact', groupe: 'Pages', label: 'Contact', detail: 'Formulaire', href: '/contact' },
  ...projets.map(p => ({
    id: p.slug,
    groupe: 'Projets' as const,
    label: p.title,
    detail: p.stack.slice(0, 3).join(' · '),
    motsCles: `${p.tagline} ${p.stack.join(' ')} ${p.contexte}`,
    href: `/projets/${p.slug}`,
  })),
  { id: 'github', groupe: 'Liens', label: 'Profil GitHub', detail: 'github.com/carls-xyz', href: 'https://github.com/carls-xyz', externe: true },
  {
    id: 'source',
    groupe: 'Liens',
    label: 'Code source du portfolio',
    detail: 'github.com/carls-xyz/portfolio',
    href: 'https://github.com/carls-xyz/portfolio',
    externe: true,
  },
  {
    id: 'verre',
    groupe: 'Réglages',
    label: 'Réglages du verre',
    detail: 'Teinte en clair et en sombre',
    motsCles: 'verre transparence glass teinte flou',
    href: '/',
    evenement: 'reglages-verre',
  },
  { id: 'cafe', groupe: 'Bestiole', label: 'Offrir un café à la bestiole', href: '/', ordre: 'cafe', secrets: ['cafe', 'coffee'] },
  { id: 'dodo', groupe: 'Bestiole', label: 'Envoyer la bestiole au lit', href: '/', ordre: 'dodo', secrets: ['dodo', 'dors', 'sleep'] },
  { id: 'saut', groupe: 'Bestiole', label: 'Faire sauter la bestiole', href: '/', ordre: 'saut', secrets: ['saute', 'saut', 'jump'] },
]

/** What the island says when the creature gets an order */
const ANNONCES: Record<Ordre, string> = {
  cafe: 'La bestiole prend un café',
  dodo: 'La bestiole va dormir',
  saut: 'Hop',
}

const ICONES = { Pages: House, Projets: FolderOpen, Liens: ArrowUpRight, Bestiole: Bug, Réglages: SlidersHorizontal }

/** Lowercase, without accents: "Pékin" matches "pekin" */
const normaliser = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** "⌘" on Apple devices, "Ctrl" elsewhere; the server renders "⌘" */
const estMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
const pasDAbonnement = () => () => {}

export default function Palette() {
  const router = useRouter()
  const chemin = usePathname()
  const dialogue = useRef<HTMLDialogElement>(null)
  // Liquid glass, without the rim lens (an animated top-layer panel), dense: it is full of text
  useVerre(dialogue, { memoire: 'palette', densiteMin: 1 })
  const champ = useRef<HTMLInputElement>(null)
  const [requete, setRequete] = useState('')
  const [actif, setActif] = useState(0)
  const idListe = useId()
  const mac = useSyncExternalStore(pasDAbonnement, estMac, () => true)

  const resultats = useMemo(() => {
    const mots = normaliser(requete).split(/\s+/).filter(Boolean)
    return COMMANDES.filter(c => {
      if (c.secrets) return c.secrets.includes(normaliser(requete.trim()))
      const texte = normaliser(`${c.label} ${c.detail ?? ''} ${c.motsCles ?? ''}`)
      return mots.every(m => texte.includes(m))
    })
  }, [requete])

  const ouvrir = () => {
    setRequete('')
    setActif(0)
    dialogue.current?.showModal()
    champ.current?.focus()
  }
  const fermer = () => dialogue.current?.close()

  // ⌘K / Ctrl+K from anywhere on the site
  useEffect(() => {
    const surTouche = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (dialogue.current?.open) dialogue.current.close()
        else {
          setRequete('')
          setActif(0)
          dialogue.current?.showModal()
          champ.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [])

  const lancer = (c: Commande | undefined) => {
    if (!c) return
    fermer()
    if (c.evenement) window.dispatchEvent(new Event(c.evenement))
    else if (c.ordre) {
      // The order waits for the creature if we are not on the home page yet
      envoyerOrdre(c.ordre)
      annoncer(ANNONCES[c.ordre])
      if (chemin !== '/') router.push('/')
    } else if (c.externe) window.open(c.href, '_blank', 'noopener,noreferrer')
    else router.push(c.href)
  }

  const surToucheChamp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActif(i => Math.min(resultats.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActif(i => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      lancer(resultats[actif])
    }
  }

  // Keep the highlighted row in view while moving with the arrows
  useEffect(() => {
    dialogue.current?.querySelector(`[data-index="${actif}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [actif])

  return (
    <>
      <button type="button" className={styles.declencheur} onClick={ouvrir} aria-label="Rechercher une page ou un projet">
        <Search size={14} aria-hidden="true" />
        <kbd className={styles.touches}>{mac ? '⌘' : 'Ctrl'} K</kbd>
      </button>

      <dialog
        ref={dialogue}
        className={styles.dialogue}
        data-verre=""
        aria-label="Palette de commandes"
        // A click on the backdrop (outside the panel) closes it
        onClick={e => e.target === e.currentTarget && fermer()}
      >
        <div className={styles.panneau}>
          <div className={styles.recherche}>
            <Search size={16} aria-hidden="true" className={styles.loupe} />
            <input
              ref={champ}
              className={styles.champ}
              value={requete}
              onChange={e => {
                setRequete(e.target.value)
                setActif(0)
              }}
              onKeyDown={surToucheChamp}
              placeholder="Page, projet ou techno"
              aria-label="Rechercher"
              role="combobox"
              aria-expanded="true"
              aria-controls={idListe}
              aria-activedescendant={resultats[actif] ? `${idListe}-${resultats[actif].id}` : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className={styles.echap}>Échap</kbd>
          </div>

          {resultats.length ? (
            <ul id={idListe} role="listbox" className={styles.liste} aria-label="Résultats">
              {resultats.map((c, i) => {
                const Icone = ICONES[c.groupe]
                // A group heading above the first result of each group
                const titre = resultats[i - 1]?.groupe !== c.groupe ? c.groupe : null
                return (
                  <li key={c.id} role="presentation">
                    {titre && (
                      <p className={styles.groupe} aria-hidden="true">
                        {titre}
                      </p>
                    )}
                    <div
                      id={`${idListe}-${c.id}`}
                      role="option"
                      aria-selected={i === actif}
                      data-index={i}
                      className={styles.option}
                      onMouseMove={() => setActif(i)}
                      onClick={() => lancer(c)}
                    >
                      <Icone size={16} aria-hidden="true" className={styles.icone} />
                      <span className={styles.label}>{c.label}</span>
                      {c.detail && <span className={styles.detail}>{c.detail}</span>}
                      {i === actif && <CornerDownLeft size={14} aria-hidden="true" className={styles.entree} />}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className={styles.vide}>
              Rien pour « {requete} ». Essayez contact, php ou rag
            </p>
          )}
        </div>
      </dialog>
    </>
  )
}
