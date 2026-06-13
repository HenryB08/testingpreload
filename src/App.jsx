import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import Preloader from './preloader/Preloader.jsx'
import Hero from './Hero.jsx'
import { useReducedMotion } from './preloader/useReducedMotion.js'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const reduced = useReducedMotion()
  const lenisRef = useRef(null)

  // Start Lenis smooth scroll only after the preloader has revealed the hero,
  // and never when the user prefers reduced motion.
  useEffect(() => {
    if (!loaded || reduced) return

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
  }, [loaded, reduced])

  return (
    <>
      <Hero active={loaded} />
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
    </>
  )
}
