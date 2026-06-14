/*!
 * Syntrex Preloader — self-contained intro overlay (drop-in widget).
 * Usage: <script src="syntrex-preloader.js" defer></script>
 * Plays once per browser session (set window.SYNTREX_PRELOADER_ALWAYS = true to
 * replay on every load). No dependencies. Everything is namespaced "sxp-".
 */
(function () {
  'use strict'

  // ---- config ----------------------------------------------------------
  var ORB_VIDEO =
    'https://mcusercontent.com/d9f0645acdcd85eb1ee1a8067/files/f14c4003-a72c-23ed-93f4-6c67b524a37b/PixVerse_V6_Image_Text_720P_Add_a_dynamic_oute_1_.mp4'
  var WORD = 'syntrexio.com'
  var TAGLINE_1 = 'custom ai systems'
  var TAGLINE_2 = 'built for you'
  var VIDEO = { start: 0.1, end: 1.2, tail: 0.4, rate: 1.35, pingOmega: 4.5 }

  // Play once per session unless told otherwise.
  try {
    if (!window.SYNTREX_PRELOADER_ALWAYS && sessionStorage.getItem('sxpShown')) return
    sessionStorage.setItem('sxpShown', '1')
  } catch (e) {}

  var reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ---- styles ----------------------------------------------------------
  var CSS = [
    '#sxp-overlay{position:fixed;inset:0;z-index:2147483600;background:#060a16;overflow:hidden;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity .6s ease}',
    '#sxp-overlay *{box-sizing:border-box}',
    '.sxp-stars{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}',
    '.sxp-lockup{position:relative;transform:scale(.6);transform-origin:center}',
    ".sxp-word{display:block;font-family:'Outfit','Poppins',system-ui,sans-serif;font-weight:700;font-size:clamp(2rem,8vw,5rem);letter-spacing:-.02em;color:#fff;white-space:nowrap}",
    '.sxp-letter{display:inline-block;white-space:pre;opacity:0;transform:translateX(26px);transition:opacity .5s ease,transform .5s cubic-bezier(.16,1,.3,1)}',
    '.sxp-orb{position:absolute;left:50%;top:50%;width:clamp(360px,72vw,760px);aspect-ratio:1/1;transform:translate(-50%,-50%);pointer-events:none}',
    '.sxp-glow{position:absolute;inset:-18%;border-radius:50%;opacity:0;transition:opacity .5s ease;background:radial-gradient(circle,rgba(47,107,255,0) 66%,rgba(130,185,255,.45) 84%,rgba(90,150,255,.6) 91%,rgba(47,107,255,0) 100%);filter:blur(24px)}',
    '.sxp-videowrap{position:absolute;inset:-25%;-webkit-mask-image:radial-gradient(circle closest-side at center,transparent 99.5%,#000 100%,#000 70%,transparent 96%);mask-image:radial-gradient(circle closest-side at center,transparent 99.5%,#000 100%,#000 70%,transparent 96%)}',
    '.sxp-videowrap video{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.2)}',
    '.sxp-ring{position:absolute;inset:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 5px rgba(150,190,255,.6))}',
    '.sxp-ring circle{stroke-dasharray:600;stroke-dashoffset:600}',
    ".sxp-tagline{position:absolute;left:0;right:0;bottom:12%;text-align:center;pointer-events:none;font-family:'Outfit','Poppins',system-ui,sans-serif}",
    '.sxp-tline{position:absolute;left:0;right:0;display:block;font-size:clamp(.8rem,1.8vw,1.05rem);font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#fff;opacity:0;transform:translateY(10px);transition:opacity .5s ease,transform .5s ease}',
    '@keyframes sxp-pulse{from{transform:scale(1);opacity:1}to{transform:scale(1.06);opacity:.85}}',
  ].join('')

  // ---- build DOM -------------------------------------------------------
  function el(tag, cls) {
    var n = document.createElement(tag)
    if (cls) n.className = cls
    return n
  }

  var style = el('style')
  style.textContent = CSS
  document.head.appendChild(style)

  var overlay = el('div')
  overlay.id = 'sxp-overlay'

  var canvas = el('canvas', 'sxp-stars')
  overlay.appendChild(canvas)

  var lockup = el('div', 'sxp-lockup')
  var word = el('span', 'sxp-word')
  var letters = []
  WORD.split('').forEach(function (ch) {
    var s = el('span', 'sxp-letter')
    s.textContent = ch
    word.appendChild(s)
    letters.push(s)
  })
  lockup.appendChild(word)

  var orb = el('div', 'sxp-orb')
  var glow = el('div', 'sxp-glow')
  var wrap = el('div', 'sxp-videowrap')
  var video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.preload = 'auto'
  var src = document.createElement('source')
  src.src = ORB_VIDEO
  src.type = 'video/mp4'
  video.appendChild(src)
  wrap.appendChild(video)

  var svgNS = 'http://www.w3.org/2000/svg'
  var svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('class', 'sxp-ring')
  svg.setAttribute('viewBox', '0 0 200 200')
  svg.setAttribute('aria-hidden', 'true')
  var circle = document.createElementNS(svgNS, 'circle')
  circle.setAttribute('cx', '100')
  circle.setAttribute('cy', '100')
  circle.setAttribute('r', '95')
  circle.setAttribute('fill', 'none')
  circle.setAttribute('stroke', '#bcd4ff')
  circle.setAttribute('stroke-width', '2.5')
  circle.setAttribute('stroke-linecap', 'round')
  svg.appendChild(circle)

  orb.appendChild(glow)
  orb.appendChild(wrap)
  orb.appendChild(svg)
  lockup.appendChild(orb)
  overlay.appendChild(lockup)

  var tagline = el('div', 'sxp-tagline')
  var line1 = el('span', 'sxp-tline')
  line1.textContent = TAGLINE_1
  var line2 = el('span', 'sxp-tline')
  line2.textContent = TAGLINE_2
  tagline.appendChild(line1)
  tagline.appendChild(line2)
  overlay.appendChild(tagline)

  function mount() {
    document.body.appendChild(overlay)
    document.documentElement.style.overflow = 'hidden'
    startStars()
    setHole(100)
    if (reduced) runReduced()
    else run()
  }

  // ---- helpers ---------------------------------------------------------
  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms)
    })
  }
  function tween(dur, ease, cb) {
    return new Promise(function (res) {
      var t0 = performance.now()
      function f(now) {
        var p = Math.min(1, (now - t0) / dur)
        cb(ease(p))
        if (p < 1) requestAnimationFrame(f)
        else res()
      }
      requestAnimationFrame(f)
    })
  }
  var easeInOut = function (p) {
    return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
  }
  var easeIn = function (p) {
    return p * p
  }
  function setHole(h) {
    var m =
      'radial-gradient(circle closest-side at center,transparent calc(' +
      h +
      '% - 0.5%),#000 ' +
      h +
      '%,#000 70%,transparent 96%)'
    wrap.style.webkitMaskImage = m
    wrap.style.maskImage = m
  }
  function showLine(n) {
    n.style.opacity = '1'
    n.style.transform = 'translateY(0)'
  }
  function hideLine(n) {
    n.style.opacity = '0'
    n.style.transform = 'translateY(-8px)'
  }

  // ---- orb video loop (smooth cosine ping-pong) ------------------------
  function setupOrbLoop() {
    var rafId = null,
      lastTs = null,
      pingpong = false,
      phase = Math.PI
    var dur = function () {
      return video.duration || VIDEO.end + 1
    }
    var winStart = function () {
      return Math.max(0, Math.min(VIDEO.start, dur() - 0.6))
    }
    var winEnd = function () {
      return Math.max(winStart() + 0.4, Math.min(VIDEO.end, dur()))
    }
    var tailStart = function () {
      return Math.max(winStart(), winEnd() - VIDEO.tail)
    }
    function seek(t) {
      try {
        video.currentTime = t
      } catch (e) {}
    }
    video.addEventListener('loadedmetadata', function () {
      video.playbackRate = VIDEO.rate
      seek(winStart())
    })
    function frame(ts) {
      if (lastTs == null) lastTs = ts
      var dt = Math.min(0.05, (ts - lastTs) / 1000)
      lastTs = ts
      if (!pingpong) {
        if (video.currentTime >= winEnd()) {
          video.pause()
          seek(winEnd())
          pingpong = true
          phase = Math.PI
        }
      } else {
        phase += dt * VIDEO.pingOmega
        var a = tailStart(),
          b = winEnd()
        seek(a + (b - a) * (0.5 - 0.5 * Math.cos(phase)))
      }
      rafId = requestAnimationFrame(frame)
    }
    video.addEventListener('play', function () {
      if (rafId == null) {
        video.playbackRate = VIDEO.rate
        lastTs = null
        rafId = requestAnimationFrame(frame)
      }
    })
  }

  // ---- timeline --------------------------------------------------------
  async function run() {
    setupOrbLoop()
    await sleep(60)
    // 1. letters slide in
    letters.forEach(function (l, i) {
      l.style.transitionDelay = i * 45 + 'ms'
      l.style.opacity = '1'
      l.style.transform = 'translateX(0)'
    })
    await sleep(1080)
    // 2. pause
    await sleep(300)
    // 3. ring draws
    await tween(650, easeInOut, function (p) {
      circle.style.strokeDashoffset = 600 * (1 - p)
    })
    await sleep(120)
    // 4. orb wipes in + starts playing
    try {
      video.currentTime = VIDEO.start
    } catch (e) {}
    video.play && video.play().catch(function () {})
    glow.style.opacity = '1'
    await tween(550, easeIn, function (p) {
      setHole(100 - 100 * p)
    })
    glow.style.animation = 'sxp-pulse 2s ease-in-out infinite alternate'
    // 5. tagline
    await sleep(150)
    showLine(line1)
    await sleep(950)
    hideLine(line1)
    await sleep(150)
    showLine(line2)
    await sleep(1000)
    // 6. reveal site
    finish()
  }

  async function runReduced() {
    letters.forEach(function (l) {
      l.style.transition = 'none'
      l.style.opacity = '1'
      l.style.transform = 'none'
    })
    circle.style.strokeDashoffset = '0'
    setHole(0)
    glow.style.opacity = '0.7'
    showLine(line2)
    await sleep(1400)
    finish()
  }

  function finish() {
    overlay.style.opacity = '0'
    document.documentElement.style.overflow = ''
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      if (style.parentNode) style.parentNode.removeChild(style)
    }, 650)
  }

  // ---- starfield -------------------------------------------------------
  function startStars() {
    var ctx = canvas.getContext('2d')
    var dpr = Math.min(window.devicePixelRatio || 1, 2)
    var W = 0,
      H = 0,
      stars = [],
      shooters = [],
      nebula = null,
      tick = 0
    var rand = function (a, b) {
      return Math.random() * (b - a) + a
    }
    function buildNebula() {
      nebula = document.createElement('canvas')
      nebula.width = W
      nebula.height = H
      var nc = nebula.getContext('2d')
      var clouds = [
        [W * 0.78, H * 0.72, W * 0.34, 'rgba(47,107,255,0.07)'],
        [W * 0.18, H * 0.3, W * 0.26, 'rgba(60,40,140,0.05)'],
        [W * 0.55, H * 0.15, W * 0.2, 'rgba(30,60,140,0.045)'],
      ]
      clouds.forEach(function (c) {
        var g = nc.createRadialGradient(c[0], c[1], 0, c[0], c[1], c[2])
        g.addColorStop(0, c[3])
        g.addColorStop(1, 'transparent')
        nc.fillStyle = g
        nc.beginPath()
        nc.arc(c[0], c[1], c[2], 0, Math.PI * 2)
        nc.fill()
      })
    }
    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildNebula()
    }
    function initStars() {
      stars = []
      var density = (W * H) / 1600
      var layers = [
        [density * 0.5, 0.2, 0.5, 0.08, 0.35, 0.003, 0.008, 0],
        [density * 0.3, 0.4, 0.9, 0.2, 0.6, 0.006, 0.018, 0.05],
        [density * 0.12, 0.8, 1.3, 0.4, 0.85, 0.01, 0.03, 0.18],
        [density * 0.03, 1.2, 1.8, 0.6, 1, 0.015, 0.04, 0.5],
      ]
      var cols = [
        [220, 235, 255],
        [210, 225, 255],
        [255, 255, 255],
        [200, 215, 255],
        [255, 250, 240],
      ]
      layers.forEach(function (l) {
        for (var i = 0; i < l[0]; i++) {
          stars.push({
            x: rand(0, W),
            y: rand(0, H),
            r: rand(l[1], l[2]),
            base: rand(l[3], l[4]),
            tw: rand(l[5], l[6]),
            off: rand(0, Math.PI * 2),
            col: cols[(Math.random() * cols.length) | 0],
            fl: Math.random() < l[7],
            ft: rand(0, 400),
            fi: rand(80, 500),
            fg: false,
            fo: 0,
          })
        }
      })
    }
    function spawn() {
      var ang = rand(18, 42) * (Math.PI / 180),
        sp = rand(6, 11)
      shooters.push({
        x: rand(W * 0.05, W * 0.9),
        y: rand(0, H * 0.5),
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        len: rand(40, 90),
        op: rand(0.5, 0.9),
        fade: rand(0.02, 0.035),
        w: rand(0.6, 1.1),
      })
    }
    function draw() {
      ctx.clearRect(0, 0, W, H)
      if (nebula) ctx.drawImage(nebula, 0, 0)
      tick++
      for (var i = shooters.length - 1; i >= 0; i--) {
        var s = shooters[i]
        var steps = Math.floor(s.len / 14)
        var tx = s.x - s.vx * steps,
          ty = s.y - s.vy * steps
        var g = ctx.createLinearGradient(tx, ty, s.x, s.y)
        g.addColorStop(0, 'rgba(255,255,255,0)')
        g.addColorStop(0.7, 'rgba(200,220,255,' + s.op * 0.5 + ')')
        g.addColorStop(1, 'rgba(255,255,255,' + s.op + ')')
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
      for (var k = 0; k < stars.length; k++) {
        var st = stars[k]
        var op = st.base * (0.45 + 0.55 * Math.sin(tick * st.tw + st.off))
        if (st.fl) {
          st.ft++
          if (st.ft >= st.fi && !st.fg) {
            st.fg = true
            st.fo = 1
            st.ft = 0
            st.fi = rand(80, 500)
          }
          if (st.fg) {
            st.fo -= 0.016
            if (st.fo <= 0) {
              st.fg = false
              st.fo = 0
            }
            op = Math.max(op, st.fo)
          }
        }
        var c = st.col
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + op + ')'
        ctx.fill()
        if (st.r > 1.3 && op > 0.65) {
          var sp2 = st.r * 3.2 * op
          ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + op * 0.22 + ')'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(st.x - sp2, st.y)
          ctx.lineTo(st.x + sp2, st.y)
          ctx.moveTo(st.x, st.y - sp2)
          ctx.lineTo(st.x, st.y + sp2)
          ctx.stroke()
        }
      }
      if (overlay.parentNode) requestAnimationFrame(draw)
    }
    resize()
    initStars()
    draw()
    if (!reduced) setInterval(function () {
      if (!overlay.parentNode) return
      if (Math.random() < 0.9) spawn()
      if (Math.random() < 0.4) spawn()
    }, 850)
    window.addEventListener('resize', function () {
      if (!overlay.parentNode) return
      resize()
      initStars()
    })
  }

  // ---- go --------------------------------------------------------------
  if (document.body) mount()
  else document.addEventListener('DOMContentLoaded', mount)
})()
