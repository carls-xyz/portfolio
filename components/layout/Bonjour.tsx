"use client"

import { useEffect } from 'react'

/** A note for developers who open the console. Renders nothing. */
export default function Bonjour() {
  useEffect(() => {
    console.info(
      '%cSalut ! %cLe code de ce portfolio est ouvert : https://github.com/carls-xyz/portfolio',
      'color:#61a7d5;font-weight:600',
      'color:inherit',
    )
  }, [])
  return null
}
