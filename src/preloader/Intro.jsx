import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from './useReducedMotion.js'

const ORB_URL = `${import.meta.env.BASE_URL}syntrex-orb.jpg`

// Intro: the "syntrexio.com" wordmark, a blue ring that draws around it, then
// the ring fills inward (outer edge fixed) to reveal the Syntrex glass orb on
// top of the word. Hands off to the main preloader via onComplete().
export default function Intro({ onComplete }) {
  const rootRef = useRef()
  const wordRef = useRef()
  const ringRef = useRef() // thin blue rim that draws on
  const fillRef = useRef() // orb-textured stroke that thickens inward

  const reduced = useReducedMotion()

  useEffect(() => {
    const ring = ringRef.current
    const fill = fillRef.current
    const len = 2 * Math.PI * 95
    gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len })
    // Fill starts as a zero-width ring at the outer edge (invisible).
    gsap.set(fill, { attr: { r: 95, 'stroke-width': 0 } })

    if (reduced) {
      gsap.set(ring, { strokeDashoffset: 0 })
      gsap.set(fill, { attr: { r: 47.5, 'stroke-width': 95 } })
      gsap.set(wordRef.current, { opacity: 1 })
      const call = gsap.delayedCall(1.0, onComplete)
      return () => call.kill()
    }

    gsap.set(wordRef.current, { opacity: 0, y: 12 })

    const tl = gsap.timeline({ onComplete })
    // 1. wordmark in
    tl.to(wordRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    // 2. blue ring draws around the word
    tl.to(ring, { strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' }, '-=0.1')
    // 3. fill inward to reveal the orb: outer edge stays at r=95 while the stroke
    //    thickens toward the centre (r shrinks, width grows).
    tl.to(
      fill,
      { attr: { r: 47.5, 'stroke-width': 95 }, duration: 0.55, ease: 'power2.in' },
      '+=0.12',
    )
    // 4. hand off to the preloader
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' }, '+=0.35')
    return () => tl.kill()
  }, [reduced, onComplete])

  return (
    <div className="intro" ref={rootRef}>
      <div className="intro__lockup">
        <span className="intro__word" ref={wordRef}>syntrexio.com</span>

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
          </defs>

          {/* Orb fill (under the rim) — grows inward to a full disc. */}
          <circle ref={fillRef} cx="100" cy="100" r="95" fill="none" stroke="url(#intro-orb)" strokeWidth="0" />

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
