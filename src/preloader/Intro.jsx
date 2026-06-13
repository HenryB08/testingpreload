import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from './useReducedMotion.js'

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

  const reduced = useReducedMotion()

  useEffect(() => {
    const ring = ringRef.current
    const video = videoRef.current
    const wrap = wrapRef.current
    const letters = wordRef.current.querySelectorAll('.intro__letter')
    const len = 2 * Math.PI * 95
    const loops = []

    // Play the settled window of the clip once, then freeze on the last frame
    // (no loop): skip the lead-in (before START) and stop at END. Tune
    // VIDEO_START / VIDEO_END (seconds) to taste.
    const VIDEO_START = 0.1
    const VIDEO_END = 1.5
    const dur = () => video.duration || VIDEO_END + 1
    const playStart = () => Math.max(0, Math.min(VIDEO_START, dur() - 0.6))
    const playEnd = () => Math.max(playStart() + 0.4, Math.min(VIDEO_END, dur()))
    const onMeta = () => {
      try {
        video.currentTime = playStart()
      } catch {
        /* seeking not ready yet */
      }
    }
    const onTime = () => {
      if (video.currentTime >= playEnd()) {
        video.currentTime = playEnd()
        video.pause()
      }
    }
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('timeupdate', onTime)
    if (video.readyState >= 1) onMeta()
    const cleanupVideo = () => {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('timeupdate', onTime)
    }

    gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len })
    gsap.set(wrap, { '--hole': '100%' }) // orb hidden (revealed by shrinking hole)
    gsap.set(glowRef.current, { opacity: 0 })

    if (reduced) {
      video.pause?.()
      gsap.set(letters, { opacity: 1, x: 0 })
      gsap.set(ring, { strokeDashoffset: 0 })
      gsap.set(wrap, { '--hole': '0%' })
      gsap.set(glowRef.current, { opacity: 0.7 })
      const call = gsap.delayedCall(1.2, onComplete)
      return () => {
        call.kill()
        cleanupVideo()
      }
    }

    video.play?.().catch(() => {})
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
    // 4. orb video wipes in from the outer edge to the centre
    tl.to(wrap, { '--hole': '0%', duration: 0.55, ease: 'power2.in' }, '+=0.12')
    // 5. horizon glow blooms, then a gentle pulse
    tl.to(glowRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    tl.call(startPulse)
    // 6. let it glow, then hand off
    tl.to({}, { duration: 1.1 })
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
              autoPlay
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
    </div>
  )
}
