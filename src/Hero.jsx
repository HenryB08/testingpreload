import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// The page revealed after the preloader. The headline animates in (line by line)
// when `active` flips true. Extra sections give Lenis something to smooth-scroll.
export default function Hero({ active }) {
  const headingRef = useRef()
  const subRef = useRef()

  useEffect(() => {
    if (!active || !headingRef.current) return
    const lines = headingRef.current.querySelectorAll('.line')
    const tl = gsap.timeline()
    tl.fromTo(
      lines,
      { yPercent: 120 },
      { yPercent: 0, duration: 1, stagger: 0.12, ease: 'power4.out' },
    )
    tl.fromTo(
      subRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.4',
    )
    return () => tl.kill()
  }, [active])

  return (
    <main className="hero-page">
      <section className="hero">
        <div className="hero__brand">syntrexio.com</div>

        <h1 className="hero__title" ref={headingRef}>
          <span className="line-wrap"><span className="line">Automation that</span></span>
          <span className="line-wrap"><span className="line">thinks for your</span></span>
          <span className="line-wrap"><span className="line">business.</span></span>
        </h1>

        <p className="hero__sub" ref={subRef}>
          Syntrex builds AI systems that run the work — so your team doesn't have to.
        </p>

        <div className="hero__scroll">scroll ↓</div>
      </section>

      <section className="panel">
        <h2>What we build</h2>
        <p>
          Autonomous agents, internal copilots, and end-to-end workflow automation,
          wired into the tools your business already runs on.
        </p>
      </section>

      <section className="panel panel--alt">
        <h2>How it feels</h2>
        <p>Fast, quiet, and reliable. The kind of automation you stop thinking about.</p>
      </section>
    </main>
  )
}
