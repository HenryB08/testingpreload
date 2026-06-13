// Smoothly loops a window of a <video>. The main pass plays forward natively
// (smooth), then the tail ping-pongs: a per-frame triangle sweep of currentTime
// back and forth between `end - tail` and `end`. Driving it with rAF (not the
// coarse `timeupdate` event) means it turns around exactly at the end with no
// overshoot — so there's no visible cut, just a continuous back-and-forth.
//
// `rate` makes it a little faster. Returns a cleanup function.
export function setupOrbLoop(
  video,
  { start = 0.1, end = 1.2, tail = 0.35, rate = 1.35, pingRate = 0.55 } = {},
) {
  let rafId = null
  let lastTs = null
  let started = false
  let pingpong = false
  let dir = -1

  const dur = () => video.duration || end + 1
  const winStart = () => Math.max(0, Math.min(start, dur() - 0.6))
  const winEnd = () => Math.max(winStart() + 0.4, Math.min(end, dur()))
  const tailStart = () => Math.max(winStart(), winEnd() - tail)
  const seek = (t) => {
    try {
      video.currentTime = t
    } catch {
      /* not seekable yet */
    }
  }

  const onMeta = () => {
    video.playbackRate = rate
    seek(winStart())
  }

  const frame = (ts) => {
    if (lastTs == null) lastTs = ts
    const dt = Math.min(0.05, (ts - lastTs) / 1000)
    lastTs = ts

    if (!pingpong) {
      // Forward native play — switch to ping-pong the instant we hit the end.
      if (video.currentTime >= winEnd()) {
        video.pause()
        seek(winEnd())
        pingpong = true
        dir = -1
      }
    } else {
      let t = video.currentTime + dir * dt * pingRate
      if (t <= tailStart()) {
        t = tailStart()
        dir = 1
      } else if (t >= winEnd()) {
        t = winEnd()
        dir = -1
      }
      seek(t)
    }
    rafId = requestAnimationFrame(frame)
  }

  const begin = () => {
    if (started) return
    started = true
    video.playbackRate = rate
    lastTs = null
    rafId = requestAnimationFrame(frame)
  }

  video.addEventListener('loadedmetadata', onMeta)
  video.addEventListener('play', begin)
  if (video.readyState >= 1) onMeta()

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    video.removeEventListener('loadedmetadata', onMeta)
    video.removeEventListener('play', begin)
  }
}
