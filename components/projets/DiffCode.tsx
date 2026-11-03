"use client"

import { useEffect, useRef, useState } from 'react'
import type { Diff } from '@/data/diffs'
import styles from './DiffCode.module.css'

/*
 * A real excerpt from the project's repository, before and after a commit.
 * "Avant" / "Après" switch between the two; removed lines fold away and added
 * ones open in their place. The first time it comes into view it starts on
 * "Avant" and flips to "Après" by itself, once.
 */
export default function DiffCode({ diff, titreSection }: { diff: Diff; titreSection: string }) {
  const [cote, setCote] = useState<'avant' | 'apres'>('apres')
  const zone = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = zone.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let t = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        setCote('avant')
        t = window.setTimeout(() => setCote('apres'), 1400)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearTimeout(t)
    }
  }, [])

  return (
    <section className={styles.diff}>
      <h2 className={titreSection}>{diff.titre}</h2>

      <div ref={zone} className={styles.cadre} data-cote={cote}>
        <div className={styles.barre}>
          <span className={styles.fichier}>{diff.fichier}</span>
          <div className={styles.bascule} role="group" aria-label="Version du code">
            {(['avant', 'apres'] as const).map(c => (
              <button
                key={c}
                type="button"
                className={styles.choix}
                aria-pressed={cote === c}
                onClick={() => setCote(c)}
              >
                {c === 'avant' ? 'Avant' : 'Après'}
              </button>
            ))}
          </div>
        </div>

        <pre className={styles.code}>
          <code>
            {diff.lignes.map((l, i) => (
              <span
                key={i}
                className={styles.ligne}
                data-cote={l.cote}
                // A line from the other version is folded away and hidden from screen readers
                aria-hidden={l.cote && l.cote !== cote ? true : undefined}
              >
                <span className={styles.repli}>
                  <span className={styles.marque}>{l.cote === 'avant' ? '−' : l.cote === 'apres' ? '+' : ' '}</span>
                  {l.texte || ' '}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      <ul className={styles.notes}>
        {diff.notes.map(n => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <a href={diff.source} target="_blank" rel="noopener noreferrer" className={styles.source}>
        Voir le commit sur GitHub ↗
      </a>
    </section>
  )
}
