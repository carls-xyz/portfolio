"use client"

import { useEffect, useRef, useState } from 'react'
import Cover from './Cover'

/**
 * The project page's cover, on the laptop screen: its gesture plays on arrival
 * (after `entree` ms), then again every few seconds, for as long as it is on
 * screen. Each replay remounts the drawing so the entrance runs from the start.
 * Still with reduced motion.
 */
export default function CoverEnBoucle({ slug, className, entree }: { slug: string; className?: string; entree: number }) {
  const [tour, setTour] = useState(0)
  const zone = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    if (zone.current) io.observe(zone.current)
    const id = window.setInterval(() => {
      if (visible && !document.hidden) setTour(t => t + 1)
    }, 4500)
    return () => {
      io.disconnect()
      window.clearInterval(id)
    }
  }, [])

  return (
    <div ref={zone}>
      <Cover key={tour} slug={slug} className={className} entree={tour === 0 ? entree : 0} />
    </div>
  )
}
