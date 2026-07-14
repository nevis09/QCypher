'use client'

import { useEffect, useState } from 'react'

export function useTheme() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Sync initial state from what the flash-prevention script already applied
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('qc-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('qc-theme', 'light')
    }
  }

  return { dark, toggle }
}
