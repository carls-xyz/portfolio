"use client"

import { useEffect, useRef, useState } from 'react'
import { CLE_VERRE, lireReglagesVerre } from './scriptTheme'
import styles from './ReglagesVerre.module.css'

/*
 * The two liquid glass settings, opened from the ⌘K palette ("Réglages du
 * verre"): how strong the tint is in the light theme and in the dark one, from
 * 0 (only blur, rim and shadow) to 1.5; 1 is the material as designed. Each
 * theme keeps its own value; switching themes glides to it (--verre-k is a
 * registered property with a transition in globals.css).
 */

type Reglages = { clair: number; sombre: number }

function appliquer(r: Reglages) {
  const racine = document.documentElement.style
  racine.setProperty('--verre-reglage-clair', String(r.clair))
  racine.setProperty('--verre-reglage-sombre', String(r.sombre))
  try {
    localStorage.setItem(CLE_VERRE, JSON.stringify(r))
  } catch {}
}

export default function ReglagesVerre() {
  const dialogue = useRef<HTMLDialogElement>(null)
  const [reglages, setReglages] = useState<Reglages>({ clair: 1, sombre: 1 })

  // Opened by the palette
  useEffect(() => {
    const ouvrir = () => {
      setReglages(lireReglagesVerre())
      dialogue.current?.showModal()
    }
    window.addEventListener('reglages-verre', ouvrir)
    return () => window.removeEventListener('reglages-verre', ouvrir)
  }, [])

  const changer = (theme: keyof Reglages, valeur: number) => {
    const suivant = { ...reglages, [theme]: valeur }
    setReglages(suivant)
    appliquer(suivant)
  }

  const curseur = (theme: keyof Reglages, libelle: string) => (
    <label className={styles.ligne}>
      <span className={styles.libelle}>
        {libelle}
        <output className={styles.valeur}>{Math.round(reglages[theme] * 100)} %</output>
      </span>
      <input
        type="range"
        min={0}
        max={1.5}
        step={0.05}
        value={reglages[theme]}
        onChange={e => changer(theme, Number(e.target.value))}
        className={styles.curseur}
      />
    </label>
  )

  return (
    <dialog
      ref={dialogue}
      className={styles.dialogue}
      aria-labelledby="reglages-verre-titre"
      // A click on the backdrop closes it
      onClick={e => e.target === e.currentTarget && dialogue.current?.close()}
    >
      <form method="dialog" className={styles.contenu}>
        <h2 id="reglages-verre-titre" className={styles.titre}>
          Réglages du verre
        </h2>
        <p className={styles.aide}>
          La teinte des surfaces en verre : la nav, la palette, les dossiers. À 0 %, il ne reste que le flou et le bord.
        </p>
        {curseur('clair', 'Thème clair')}
        {curseur('sombre', 'Thème sombre')}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaire}
            onClick={() => {
              setReglages({ clair: 1, sombre: 1 })
              appliquer({ clair: 1, sombre: 1 })
            }}
          >
            Par défaut
          </button>
          <button type="submit" className={styles.principal}>
            Fermer
          </button>
        </div>
      </form>
    </dialog>
  )
}
