'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { site } from '@/config/site'
import type { DoorScene } from './doorScene'
import './door.css'

type Phase = 'closed' | 'opening' | 'fading' | 'gone'

/**
 * Full-screen 3D entrance. Shown on every fresh visit, never on /admin
 * (this component only lives in the public (site) layout), skipped for prefers-reduced-motion
 * and when WebGL is unavailable. Real page content is server-rendered underneath for SEO.
 */
export function DoorEntrance() {
  const [phase, setPhase] = useState<Phase>('closed')
  const [ready, setReady] = useState(false)
  const [openingQueued, setOpeningQueued] = useState(false)
  const phaseRef = useRef<Phase>('closed')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<DoorScene | null>(null)
  const openBtnRef = useRef<HTMLButtonElement>(null)
  const skipBtnRef = useRef<HTMLButtonElement>(null)
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openPendingRef = useRef(false)

  const go = (p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }

  const finish = useCallback(() => {
    if (phaseRef.current === 'gone' || phaseRef.current === 'fading') return
    if (loadTimer.current) clearTimeout(loadTimer.current)
    if (openingTimer.current) clearTimeout(openingTimer.current)
    if (autoOpenTimer.current) clearTimeout(autoOpenTimer.current)
    go('fading')
    document.body.style.overflow = ''
    finishTimer.current = setTimeout(() => {
      sceneRef.current?.dispose()
      sceneRef.current = null
      go('gone') // unmount completely
    }, 560)
  }, [])

  const open = useCallback(() => {
    if (autoOpenTimer.current) {
      clearTimeout(autoOpenTimer.current)
      autoOpenTimer.current = null
    }
    if (phaseRef.current !== 'closed') return
    if (!sceneRef.current) {
      openPendingRef.current = true
      setOpeningQueued(true)
      return
    }
    go('opening')
    sceneRef.current.open()
    openingTimer.current = setTimeout(finish, 4000)
  }, [finish])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      go('gone')
      return
    }
    document.body.style.overflow = 'hidden'
    openBtnRef.current?.focus({ preventScroll: true })
    let cancelled = false
    loadTimer.current = setTimeout(finish, 8000)

    import('./doorScene')
      .then(({ createDoorScene }) => {
        if (cancelled || !canvasRef.current || phaseRef.current !== 'closed') return
        try {
          sceneRef.current = createDoorScene(canvasRef.current, {
            interiorUrl: '/doors/interior.webp',
            onDone: finish,
          })
          if (loadTimer.current) {
            clearTimeout(loadTimer.current)
            loadTimer.current = null
          }
          requestAnimationFrame(() => {
            setReady(true)
            if (openPendingRef.current) {
              go('opening')
              sceneRef.current?.open()
              openingTimer.current = setTimeout(finish, 4000)
            } else {
              // Automatically swing open after 1.4s so visitors don't have to guess to click
              autoOpenTimer.current = setTimeout(() => {
                if (phaseRef.current === 'closed' && sceneRef.current) {
                  go('opening')
                  sceneRef.current.open()
                  openingTimer.current = setTimeout(finish, 4000)
                }
              }, 1400)
            }
          })
        } catch {
          finish() // no WebGL
        }
      })
      .catch(finish)

    return () => {
      cancelled = true
      if (finishTimer.current) clearTimeout(finishTimer.current)
      if (loadTimer.current) clearTimeout(loadTimer.current)
      if (openingTimer.current) clearTimeout(openingTimer.current)
      if (autoOpenTimer.current) clearTimeout(autoOpenTimer.current)
      document.body.style.overflow = ''
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [finish])

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      finish()
    } else if (e.key === 'Tab') {
      const first = openBtnRef.current
      const last = skipBtnRef.current
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  if (phase === 'gone') return null

  return (
    <div
      className={`door-stage ${phase === 'opening' ? 'is-opening' : ''} ${phase === 'fading' ? 'is-done' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Welcome to ${site.name}. Open the doors to enter.`}
      onClick={open}
      onKeyDown={onKeyDown}
    >
      <canvas ref={canvasRef} className={`door-canvas ${ready ? 'is-ready' : ''}`} aria-hidden />
      <div className="door-brand">
        <p className="font-display text-[clamp(20px,3.2vw,34px)] uppercase tracking-[0.3em]">{site.name}</p>
        <button
          ref={openBtnRef}
          type="button"
          onClick={e => {
            e.stopPropagation()
            open()
          }}
          className="pointer-events-auto mt-3 inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-mono text-xs uppercase tracking-wide3 text-[#f1dfae]"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden />
          {openingQueued ? 'Opening the doors...' : ready ? 'Tap or wait to open doors' : 'Preparing your entrance'}
        </button>
      </div>
      <button
        ref={skipBtnRef}
        type="button"
        className="door-skip"
        onClick={e => {
          e.stopPropagation()
          finish()
        }}
      >
        Skip intro <span className="sr-only">(Escape)</span>
      </button>
    </div>
  )
}
