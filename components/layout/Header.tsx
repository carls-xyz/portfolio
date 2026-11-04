"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef } from 'react'
import Palette from './Palette'
import Theme from './Theme'
import { useVerre } from './verre'
import styles from './Header.module.css'

const LIENS = [
  { href: '/', label: 'Accueil' },
  { href: '/projets', label: 'Projets' },
  { href: '/contact', label: 'Contact' },
]

function actif(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function Header() {
  const pathname = usePathname()
  const menu = useRef<HTMLUListElement>(null)
  const barre = useRef<HTMLElement>(null)
  // Liquid glass: the content scrolls under the nav, so the ink follows what is behind it
  useVerre(barre, { lentille: true, memoire: 'nav', suitDefilement: true })

  // One pill glides to the current page; it re-measures when the menu resizes
  useLayoutEffect(() => {
    const ul = menu.current
    if (!ul) return
    const placer = () => {
      const lien = ul.querySelector<HTMLElement>('[aria-current="page"]')
      if (!lien) {
        ul.style.setProperty('--pastille-o', '0')
        return
      }
      const x = lien.getBoundingClientRect().left - ul.getBoundingClientRect().left
      ul.style.setProperty('--pastille-x', `${x}px`)
      ul.style.setProperty('--pastille-w', `${lien.offsetWidth}px`)
      ul.style.setProperty('--pastille-o', '1')
    }
    placer()
    const ro = new ResizeObserver(placer)
    ro.observe(ul)
    return () => ro.disconnect()
  }, [pathname])

  return (
    <header className={styles.header}>
      <nav ref={barre} className={styles.nav} aria-label="Navigation principale" data-verre="">
        <ul ref={menu} className={styles.menu}>
          {LIENS.map(lien => (
            <li key={lien.href}>
              <Link
                href={lien.href}
                className={styles.link}
                aria-current={actif(pathname, lien.href) ? 'page' : undefined}
              >
                {lien.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.outils}>
          <Palette />
          <Theme />
        </div>
      </nav>
    </header>
  )
}
