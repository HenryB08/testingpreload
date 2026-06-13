import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import Intro from './preloader/Intro.jsx'
import Preloader from './preloader/Preloader.jsx'
import Hero from './Hero.jsx'
import { useReducedMotion } from './preloader/useReducedMotion.js'

// Phases: 'intro' (steven-style wordmark + stroke) -> 'preloader' (3D scene with
// 00->100 counter) -> 'done' (hero revealed, smooth scroll active).
export default function App() {
  const [phase, setPhase] = useState('intro')
  const reduced = useReducedMotion()
  const lenisRef = useRef(null)

  // Start Lenis smooth scroll only after the preloader has revealed the hero,
  // and never when the user prefers reduced motion.
  useEffect(() => {
    if (phase !== 'done' || reduced) return

    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 })
    lenisRef.current = lenis

    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [phase, reduced])

  return (
    <>
      <Hero active={phase === 'done'} />
      {phase === 'preloader' && <Preloader onComplete={() => setPhase('done')} />}
      {phase === 'intro' && <Intro onComplete={() => setPhase('preloader')} />}
    </>
  )
}
