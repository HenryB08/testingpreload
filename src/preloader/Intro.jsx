import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from './useReducedMotion.js'

const ORB_URL = `${import.meta.env.BASE_URL}syntrex-orb.jpg`
const WORD = 'syntrexio.com'

// Lens-flare sparkle positions around the orb rim (% within the orb box).
const SPARKS = [
  { top: '22%', left: '75%', size: '20%' },
  { top: '26%', left: '27%', size: '16%' },
  { top: '76%', left: '70%', size: '18%' },
  { top: '80%', left: '30%', size: '14%' },
  { top: '15%', left: '50%', size: '12%' },
]

// Intro: the letters of "syntrexio.com" slide in and settle, pause, then a rim
// draws around the word, the Syntrex glass orb wipes in (outside-in), and the
// orb ignites — a blue glow blooms and sparkle flares twinkle on. Hands off to
// the preloader via onComplete().
export default function Intro({ onComplete }) {
  const rootRef = useRef()
  const wordRef = useRef()
  const orbRef = useRef()
  const ringRef = useRef() // rim that draws on (orb-textured)
  const maskRef = useRef() // black circle in the wipe mask; shrinks 95 -> 0
  const glowRef = useRef()

  const reduced = useReducedMotion()

  useEffect(() => {
    const ring = ringRef.current
    const mask = maskRef.current
    const letters = wordRef.current.querySelectorAll('.intro__letter')
    const sparks = orbRef.current.querySelectorAll('.intro__spark')
    const len = 2 * Math.PI * 95
    const loops = []

    gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len })
    gsap.set(mask, { attr: { r: 95 } })
    gsap.set(glowRef.current, { opacity: 0 })
    gsap.set(sparks, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })

    if (reduced) {
      gsap.set(letters, { opacity: 1, x: 0 })
      gsap.set(ring, { strokeDashoffset: 0 })
      gsap.set(mask, { attr: { r: 0 } })
      gsap.set(glowRef.current, { opacity: 0.7 })
      gsap.set(sparks, { scale: 1, opacity: 0.9 })
      const call = gsap.delayedCall(1.2, onComplete)
      return () => call.kill()
    }

    gsap.set(letters, { opacity: 0, x: 26 })

    // Ongoing shimmer once the orb has ignited.
    const startPulse = () => {
      loops.push(
        gsap.to(glowRef.current, {
          scale: 1.07,
          opacity: 0.85,
          duration: 1.0,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        }),
      )
      loops.push(
        gsap.to(sparks, {
          scale: 0.82,
          opacity: 0.55,
          duration: 0.8,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          stagger: { each: 0.18, from: 'random' },
        }),
      )
    }

    const tl = gsap.timeline({ onComplete })
    // 1. letters slide in and settle
    tl.to(letters, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.045 })
    // 2. brief pause with the words at rest
    tl.to({}, { duration: 0.3 })
    // 3. rim draws around the word
    tl.to(ring, { strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' })
    // 4. orb wipes in from the outer edge to the centre
    tl.to(mask, { attr: { r: 0 }, duration: 0.55, ease: 'power2.in' }, '+=0.12')
    // 5. ignite: glow blooms + sparkles twinkle on
    tl.to(glowRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.15')
    tl.to(sparks, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.07 }, '<0.05')
    tl.call(startPulse)
    // 6. let it shine, then hand off
    tl.to({}, { duration: 1.1 })
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' })

    return () => {
      tl.kill()
      loops.forEach((l) => l.kill())
    }
  }, [reduced, onComplete])

  return (
    <div className="intro" ref={rootRef}>
      <div className="intro__lockup">
        <span className="intro__word" ref={wordRef}>
          {WORD.split('').map((ch, i) => (
            <span className="intro__letter" key={i}>{ch}</span>
          ))}
        </span>

        <div className="intro__orb" ref={orbRef}>
          <div className="intro__glow" ref={glowRef} />

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

          {SPARKS.map((s, i) => (
            <span
              key={i}
              className="intro__spark"
              style={{ top: s.top, left: s.left, width: s.size }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
