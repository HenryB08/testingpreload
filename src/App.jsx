import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import Intro from './preloader/Intro.jsx'
import Hero from './Hero.jsx'
import Starfield from './Starfield.jsx'
import { useReducedMotion } from './preloader/useReducedMotion.js'

// Phases: 'intro' (wordmark + orb fill + tagline) -> 'done' (hero revealed,
// smooth scroll active).
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
      <Starfield />
      {phase === 'done' && <Hero active />}
      {phase === 'intro' && <Intro onComplete={() => setPhase('done')} />}
    </>
  )
}
