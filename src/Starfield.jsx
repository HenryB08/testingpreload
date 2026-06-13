import { useEffect, useRef } from 'react'

const rand = (min, max) => Math.random() * (max - min) + min

// Full-screen galaxy background: faint nebula clouds, layered twinkling stars,
// and tiny shooting stars. Pure 2D canvas, sits behind everything.
export default function Starfield() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0
    let stars = []
    let shooters = []
    let nebula = null
    let raf = null
    let tick = 0

    function buildNebula() {
      nebula = document.createElement('canvas')
      nebula.width = W
      nebula.height = H
      const nc = nebula.getContext('2d')
      const clouds = [
        { x: W * 0.78, y: H * 0.72, r: W * 0.34, c: 'rgba(47,107,255,0.07)' },
        { x: W * 0.18, y: H * 0.3, r: W * 0.26, c: 'rgba(60,40,140,0.05)' },
        { x: W * 0.55, y: H * 0.15, r: W * 0.2, c: 'rgba(30,60,140,0.045)' },
        { x: W * 0.9, y: H * 0.4, r: W * 0.18, c: 'rgba(20,40,100,0.04)' },
      ]
      clouds.forEach((cl) => {
        const g = nc.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, cl.r)
        g.addColorStop(0, cl.c)
        g.addColorStop(1, 'transparent')
        nc.fillStyle = g
        nc.beginPath()
        nc.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2)
        nc.fill()
      })
    }

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildNebula()
    }

    function initStars() {
      stars = []
      const density = (W * H) / 1600
      const layers = [
        { n: density * 0.5, rMin: 0.2, rMax: 0.5, oMin: 0.08, oMax: 0.35, tw: [0.003, 0.008], flash: 0 },
        { n: density * 0.3, rMin: 0.4, rMax: 0.9, oMin: 0.2, oMax: 0.6, tw: [0.006, 0.018], flash: 0.05 },
        { n: density * 0.12, rMin: 0.8, rMax: 1.3, oMin: 0.4, oMax: 0.85, tw: [0.01, 0.03], flash: 0.18 },
        { n: density * 0.03, rMin: 1.2, rMax: 1.8, oMin: 0.6, oMax: 1, tw: [0.015, 0.04], flash: 0.5 },
      ]
      const cols = [
        [220, 235, 255],
        [210, 225, 255],
        [255, 255, 255],
        [200, 215, 255],
        [255, 250, 240],
      ]
      layers.forEach((l) => {
        for (let i = 0; i < l.n; i++) {
          stars.push({
            x: rand(0, W),
            y: rand(0, H),
            r: rand(l.rMin, l.rMax),
            base: rand(l.oMin, l.oMax),
            tw: rand(l.tw[0], l.tw[1]),
            off: rand(0, Math.PI * 2),
            col: cols[(Math.random() * cols.length) | 0],
            flasher: Math.random() < l.flash,
            ft: rand(0, 400),
            fi: rand(80, 500),
            flashing: false,
            fo: 0,
          })
        }
      })
    }

    function spawnShooter() {
      const angle = rand(18, 42) * (Math.PI / 180)
      const speed = rand(6, 11)
      shooters.push({
        x: rand(W * 0.05, W * 0.9),
        y: rand(0, H * 0.5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: rand(40, 90), // tiny
        op: rand(0.5, 0.9),
        fade: rand(0.02, 0.035),
        w: rand(0.6, 1.1),
      })
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      if (nebula) ctx.drawImage(nebula, 0, 0)
      tick++

      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i]
        const steps = Math.floor(s.len / 14)
        const tx = s.x - s.vx * steps
        const ty = s.y - s.vy * steps
        const g = ctx.createLinearGradient(tx, ty, s.x, s.y)
        g.addColorStop(0, 'rgba(255,255,255,0)')
        g.addColorStop(0.7, `rgba(200,220,255,${s.op * 0.5})`)
        g.addColorStop(1, `rgba(255,255,255,${s.op})`)
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = g
        ctx.lineWidth = s.w
        ctx.stroke()
        s.x += s.vx
        s.y += s.vy
        s.op -= s.fade
        if (s.op <= 0 || s.x > W + 60 || s.y > H + 60) shooters.splice(i, 1)
      }

      for (const s of stars) {
        const twinkle = 0.45 + 0.55 * Math.sin(tick * s.tw + s.off)
        let op = s.base * twinkle
        if (s.flasher) {
          s.ft++
          if (s.ft >= s.fi && !s.flashing) {
            s.flashing = true
            s.fo = 1
            s.ft = 0
            s.fi = rand(80, 500)
          }
          if (s.flashing) {
            s.fo -= 0.016
            if (s.fo <= 0) {
              s.flashing = false
              s.fo = 0
            }
            op = Math.max(op, s.fo)
          }
        }
        const [r, g, b] = s.col
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${op})`
        ctx.fill()
        if (s.r > 1.3 && op > 0.65) {
          const spike = s.r * 3.2 * op
          ctx.strokeStyle = `rgba(${r},${g},${b},${op * 0.22})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(s.x - spike, s.y)
          ctx.lineTo(s.x + spike, s.y)
          ctx.moveTo(s.x, s.y - spike)
          ctx.lineTo(s.x, s.y + spike)
          ctx.stroke()
        }
        if (s.r > 0.9 && op > 0.4) {
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.2)
          grd.addColorStop(0, `rgba(${r},${g},${b},${op * 0.18})`)
          grd.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(draw)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    resize()
    initStars()
    draw()
    const shootInt = reduced ? null : setInterval(() => {
      if (Math.random() < 0.7) spawnShooter()
    }, 1600)

    const onResize = () => {
      resize()
      initStars()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      if (shootInt) clearInterval(shootInt)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />
}
