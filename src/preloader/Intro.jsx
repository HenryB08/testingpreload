import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from './useReducedMotion.js'

// Steven.com-style intro: the "syntrexio.com" wordmark with a single hand-drawn
// marker stroke that sweeps across it, in Syntrex colors. Plays first, then
// hands off to the main preloader via onComplete().
export default function Intro({ onComplete }) {
  const rootRef = useRef()
  const wordRef = useRef()
  const strokeRef = useRef()
  const reduced = useReducedMotion()

  useEffect(() => {
    const path = strokeRef.current
    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })

    // Reduced motion: show the finished lockup, hold briefly, then continue.
    if (reduced) {
      gsap.set(path, { strokeDashoffset: 0 })
      gsap.set(wordRef.current, { opacity: 1 })
      const call = gsap.delayedCall(0.9, onComplete)
      return () => call.kill()
    }

    gsap.set(wordRef.current, { opacity: 0, y: 12 })

    const tl = gsap.timeline({ onComplete })
    tl.to(wordRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    tl.to(path, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.15')
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' }, '+=0.45')
    return () => tl.kill()
  }, [reduced, onComplete])

  return (
    <div className="intro" ref={rootRef}>
      <div className="intro__lockup">
        <span className="intro__word" ref={wordRef}>syntrexio.com</span>

        <svg
          className="intro__stroke"
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="intro-rough">
              <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
            </filter>
          </defs>
          <path
            ref={strokeRef}
            d="M18 162 C 180 142, 360 80, 582 52"
            fill="none"
            stroke="#2f6bff"
            strokeWidth="13"
            strokeLinecap="round"
            filter="url(#intro-rough)"
          />
        </svg>
      </div>
    </div>
  )
}
