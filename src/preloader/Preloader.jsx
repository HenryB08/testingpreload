import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import Scene from './Scene.jsx'
import { useReducedMotion } from './useReducedMotion.js'

// Full-screen preloader: the 3D scene plus an HTML overlay (brand, 00->100
// counter, progress line). Drives a fake load to 100, then a GSAP reveal that
// fades the overlay out and hands off to the hero via onComplete().
export default function Preloader({ onComplete }) {
  const reduced = useReducedMotion()
  const rootRef = useRef()
  const progressObj = useRef({ value: 0 })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Reduced motion: skip the animated count, hold briefly, then reveal.
    if (reduced) {
      setProgress(100)
      const tl = gsap.timeline({ onComplete })
      tl.to(rootRef.current, { autoAlpha: 0, duration: 0.4, delay: 0.6 })
      return () => tl.kill()
    }

    const tl = gsap.timeline()
    tl.to(progressObj.current, {
      value: 100,
      duration: 3.2,
      ease: 'power2.inOut',
      onUpdate: () => setProgress(Math.round(progressObj.current.value)),
    })
    tl.to(rootRef.current, {
      autoAlpha: 0,
      scale: 1.06,
      duration: 0.9,
      ease: 'power3.inOut',
      onComplete,
    })
    return () => tl.kill()
  }, [reduced, onComplete])

  return (
    <div className="preloader" ref={rootRef}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <Scene reduced={reduced} />
      </Canvas>

      <div className="preloader__brand">syntrexio.com</div>

      <div className="preloader__counter">
        <div className="preloader__count">
          <span className="preloader__count-num">{String(progress).padStart(2, '0')}</span>
          <span className="preloader__count-max">/100</span>
        </div>
        <div className="preloader__bar">
          <div className="preloader__bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
