'use client'

import { useEffect } from 'react'

export function NoBottomOverscroll() {
  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      const el = document.scrollingElement ?? document.documentElement
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
      if (atBottom) e.preventDefault()
    }

    document.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => document.removeEventListener('touchmove', onTouchMove)
  }, [])

  return null
}
