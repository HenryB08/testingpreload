import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from './useReducedMotion.js'

const ORB_URL = `${import.meta.env.BASE_URL}syntrex-orb.jpg`
const WORD = 'syntrexio.com'

// Intro: the letters of "syntrexio.com" slide in and settle, pause, then a rim
// draws around the word and the Syntrex glass orb wipes in from the outer edge
// to the centre (a solid, fully-filled disc) on top of the word. Hands off to
// the preloader via onComplete().
export default function Intro({ onComplete }) {
  const rootRef = useRef()
  const wordRef = useRef()
  const ringRef = useRef() // rim that draws on (orb-textured)
  const maskRef = useRef() // black circle in the wipe mask; shrinks 95 -> 0

  const reduced = useReducedMotion()

  useEffect(() => {
    const ring = ringRef.current
    const mask = maskRef.current
    const letters = wordRef.current.querySelectorAll('.intro__letter')
    const len = 2 * Math.PI * 95

    gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len })
    // Mask fully covers the disc -> orb hidden to start.
    gsap.set(mask, { attr: { r: 95 } })

    if (reduced) {
      gsap.set(letters, { opacity: 1, x: 0 })
      gsap.set(ring, { strokeDashoffset: 0 })
      gsap.set(mask, { attr: { r: 0 } })
      const call = gsap.delayedCall(1.0, onComplete)
      return () => call.kill()
    }

    gsap.set(letters, { opacity: 0, x: 26 })

    const tl = gsap.timeline({ onComplete })
    // 1. letters slide in and settle in the middle
    tl.to(letters, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.045 })
    // 2. brief pause with the words at rest
    tl.to({}, { duration: 0.3 })
    // 3. rim draws around the word
    tl.to(ring, { strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' })
    // 4. orb wipes in from the outer edge to the centre (shrinking the mask)
    tl.to(mask, { attr: { r: 0 }, duration: 0.55, ease: 'power2.in' }, '+=0.12')
    // 5. hand off to the preloader
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' }, '+=0.35')
    return () => tl.kill()
  }, [reduced, onComplete])

  return (
    <div className="intro" ref={rootRef}>
      <div className="intro__lockup">
        <span className="intro__word" ref={wordRef}>
          {WORD.split('').map((ch, i) => (
            <span className="intro__letter" key={i}>{ch}</span>
          ))}
        </span>

        <svg className="intro__circle" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            {/* The orb image, slightly zoomed and centred so its glass rim sits
                just outside the disc and the (baked-in) checkerboard corners
                never show. */}
            <pattern id="intro-orb" patternUnits="userSpaceOnUse" width="200" height="200">
              <image
                href={ORB_URL}
                x="-12"
                y="-12"
                width="224"
                height="224"
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>

            {/* Wipe mask: white reveals, the black circle hides. Shrinking the
                black circle reveals the orb from the outer edge inward. */}
            <mask id="intro-wipe">
              <rect x="0" y="0" width="200" height="200" fill="white" />
              <circle ref={maskRef} cx="100" cy="100" r="95" fill="black" />
            </mask>
          </defs>

          {/* Solid orb disc, revealed outside-in by the wipe mask. */}
          <circle cx="100" cy="100" r="95" fill="url(#intro-orb)" mask="url(#intro-wipe)" />

          {/* Rim that draws on — uses the orb image itself, so its colour and
              glassy highlights match the PNG and align with the fill. */}
          <circle
            ref={ringRef}
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="url(#intro-orb)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
