import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from './useReducedMotion.js'
import { setupOrbLoop } from './orbLoop.js'

const ORB_POSTER = `${import.meta.env.BASE_URL}syntrex-orb.jpg`
const ORB_VIDEO =
  'https://mcusercontent.com/d9f0645acdcd85eb1ee1a8067/files/f14c4003-a72c-23ed-93f4-6c67b524a37b/PixVerse_V6_Image_Text_720P_Add_a_dynamic_oute_1_.mp4'

// Gear scene: the Syntrex orb sits in the middle while dark metallic rings and a
// rainbow chromatic shimmer rotate around it. Plays after the intro, then hands
// off to the hero via onComplete().
export default function GearOrb({ onComplete }) {
  const rootRef = useRef()
  const videoRef = useRef()
  const reduced = useReducedMotion()

  useEffect(() => {
    const video = videoRef.current

    // Same smooth ping-pong loop as the intro orb.
    const cleanupVideo = setupOrbLoop(video, { start: 0.1, end: 1.2, tail: 0.25 })
    if (!reduced) video.play?.().catch(() => {})

    const tl = gsap.timeline({ onComplete })
    tl.from(rootRef.current, { autoAlpha: 0, duration: 0.6, ease: 'power2.out' })
    tl.to({}, { duration: reduced ? 1.2 : 3.6 }) // let the gears turn
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' })

    return () => {
      tl.kill()
      cleanupVideo()
    }
  }, [reduced, onComplete])

  return (
    <div className="gearorb" ref={rootRef}>
      <div className="gearorb__stage">
        <div className="gearorb__chroma" />
        <div className="gearorb__gear gearorb__gear--1" />
        <div className="gearorb__gear gearorb__gear--2" />
        <div className="gearorb__gear gearorb__gear--3" />
        <div className="gearorb__bar" />

        <div className="gearorb__orb">
          <video ref={videoRef} poster={ORB_POSTER} autoPlay muted playsInline preload="auto">
            <source src={ORB_VIDEO} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  )
}
