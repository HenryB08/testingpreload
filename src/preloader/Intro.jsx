import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from './useReducedMotion.js'

// Intro: the "syntrexio.com" wordmark with a perfect circle that draws itself
// around it, in Syntrex colors. Plays first, then hands off to the main
// preloader via onComplete().
export default function Intro({ onComplete }) {
  const rootRef = useRef()
  const wordRef = useRef()
  const circleRef = useRef()
  const reduced = useReducedMotion()

  useEffect(() => {
    const circle = circleRef.current
    // Circumference of the SVG circle (r = 95 in the 200x200 viewBox).
    const len = 2 * Math.PI * 95
    gsap.set(circle, { strokeDasharray: len, strokeDashoffset: len })

    // Reduced motion: show the finished lockup, hold briefly, then continue.
    if (reduced) {
      gsap.set(circle, { strokeDashoffset: 0 })
      gsap.set(wordRef.current, { opacity: 1 })
      const call = gsap.delayedCall(0.9, onComplete)
      return () => call.kill()
    }

    gsap.set(wordRef.current, { opacity: 0, y: 12 })

    const tl = gsap.timeline({ onComplete })
    tl.to(wordRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    tl.to(circle, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, '-=0.1')
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' }, '+=0.45')
    return () => tl.kill()
  }, [reduced, onComplete])

  return (
    <div className="intro" ref={rootRef}>
      <div className="intro__lockup">
        <span className="intro__word" ref={wordRef}>syntrexio.com</span>

        <svg className="intro__circle" viewBox="0 0 200 200" aria-hidden="true">
          <circle
            ref={circleRef}
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="#2f6bff"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
        </svg>
      </div>
    </div>
  )
}
