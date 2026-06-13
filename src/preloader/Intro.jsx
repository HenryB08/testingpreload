import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from './useReducedMotion.js'
import { setupOrbLoop } from './orbLoop.js'

// Still frame used as the video poster (instant) while the orb video loads.
const ORB_POSTER = `${import.meta.env.BASE_URL}syntrex-orb.jpg`
// The live glowing orb video (same asset as the syntrexio.com hero bubble).
const ORB_VIDEO =
  'https://mcusercontent.com/d9f0645acdcd85eb1ee1a8067/files/f14c4003-a72c-23ed-93f4-6c67b524a37b/PixVerse_V6_Image_Text_720P_Add_a_dynamic_oute_1_.mp4'
const WORD = 'syntrexio.com'

// Intro: the letters of "syntrexio.com" slide in and settle, pause, then a rim
// draws around the word and the glowing Syntrex orb video wipes in (outside-in)
// on top of it, with a blue horizon glow. Hands off via onComplete().
export default function Intro({ onComplete }) {
  const rootRef = useRef()
  const wordRef = useRef()
  const orbRef = useRef()
  const wrapRef = useRef()
  const videoRef = useRef()
  const ringRef = useRef()
  const glowRef = useRef()
  const line1Ref = useRef()
  const line2Ref = useRef()

  const reduced = useReducedMotion()

  useEffect(() => {
    const ring = ringRef.current
    const video = videoRef.current
    const wrap = wrapRef.current
    const letters = wordRef.current.querySelectorAll('.intro__letter')
    const len = 2 * Math.PI * 95
    const loops = []

    // Play the settled window once, then smoothly ping-pong its tail.
    const cleanupVideo = setupOrbLoop(video, { start: 0.1, end: 1.2 })

    gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len })
    gsap.set(wrap, { '--hole': '100%' }) // orb hidden (revealed by shrinking hole)
    gsap.set(glowRef.current, { opacity: 0 })
    gsap.set([line1Ref.current, line2Ref.current], { opacity: 0, y: 10 })

    if (reduced) {
      video.pause?.()
      gsap.set(letters, { opacity: 1, x: 0 })
      gsap.set(ring, { strokeDashoffset: 0 })
      gsap.set(wrap, { '--hole': '0%' })
      gsap.set(glowRef.current, { opacity: 0.7 })
      gsap.set(line2Ref.current, { opacity: 1, y: 0 })
      const call = gsap.delayedCall(1.2, onComplete)
      return () => {
        call.kill()
        cleanupVideo()
      }
    }

    // Hold on the first frame; the video is started when the orb is revealed.
    video.pause?.()
    gsap.set(letters, { opacity: 0, x: 26 })

    const startPulse = () => {
      loops.push(
        gsap.to(glowRef.current, {
          scale: 1.06,
          opacity: 0.85,
          duration: 1.0,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        }),
      )
    }

    const tl = gsap.timeline({ onComplete })
    // 1. letters slide in and settle
    tl.to(letters, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.045 })
    // 2. brief pause
    tl.to({}, { duration: 0.3 })
    // 3. rim draws around the word
    tl.to(ring, { strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' })
    // 4. orb video wipes in from the outer edge to the centre — start the clip
    //    here so its play happens while it's visible (then it ping-pong loops).
    tl.to(
      wrap,
      {
        '--hole': '0%',
        duration: 0.55,
        ease: 'power2.in',
        onStart: () => {
          try {
            video.currentTime = 0.1
          } catch {
            /* not seekable yet */
          }
          video.play?.().catch(() => {})
        },
      },
      '+=0.12',
    )
    // 5. horizon glow blooms, then a gentle pulse
    tl.to(glowRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    tl.call(startPulse)
    // 6. bottom tagline: "custom ai systems" -> "built for you"
    tl.to(line1Ref.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '+=0.15')
    tl.to({}, { duration: 0.95 })
    tl.to(line1Ref.current, { opacity: 0, y: -8, duration: 0.4, ease: 'power2.in' })
    tl.to(line2Ref.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.1')
    tl.to({}, { duration: 1.0 })
    // 7. hand off
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' })

    return () => {
      tl.kill()
      loops.forEach((l) => l.kill())
      cleanupVideo()
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

          {/* Circle-clipped wrapper holds the wipe mask; the video inside is
              zoomed so the orb's horizon reaches the edge. */}
          <div className="intro__videowrap" ref={wrapRef}>
            <video
              ref={videoRef}
              className="intro__video"
              poster={ORB_POSTER}
              muted
              playsInline
              preload="auto"
            >
              <source src={ORB_VIDEO} type="video/mp4" />
            </video>
          </div>

          {/* Thin glowing rim that draws on around the word. */}
          <svg className="intro__circle" viewBox="0 0 200 200" aria-hidden="true">
            <circle
              ref={ringRef}
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="#bcd4ff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom tagline (not scaled with the lockup). */}
      <div className="intro__tagline">
        <span className="intro__tagline-line" ref={line1Ref}>custom ai systems</span>
        <span className="intro__tagline-line" ref={line2Ref}>built for you</span>
      </div>
    </div>
  )
}
