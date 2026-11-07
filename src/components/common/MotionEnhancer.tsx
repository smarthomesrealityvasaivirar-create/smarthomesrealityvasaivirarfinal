'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/** Progressive enhancement: content is visible even without JS; no animation library. */
export function MotionEnhancer() {
  const pathname = usePathname()
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const animations: Animation[] = []
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        animations.push(entry.target.animate(
          [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 480, easing: 'cubic-bezier(.16, 1, 0.3, 1)', fill: 'both' }
        ))
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.06 })
    document.querySelectorAll('main section, main article, main dl, main .section, main form').forEach(el => observer.observe(el))
    return () => { observer.disconnect(); animations.forEach(a => a.cancel()) }
  }, [pathname])
  return null
}
