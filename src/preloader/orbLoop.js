// Smoothly loops a window of a <video> by ping-ponging its tail: it plays
// forward (native, smooth) to `end`, then eases back in reverse to `end - tail`,
// then forward again, and so on. Reversing is done by stepping currentTime each
// frame because browsers can't play media backwards. Direction only flips at the
// turning points (velocity ~0), so there's no jump — unlike a hard loop cut.
//
// Returns a cleanup function.
export function setupOrbLoop(video, { start = 0.1, end = 1.2, tail = 0.25 } = {}) {
  let rafId = null
  let lastTs = null
  let reversing = false

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

  const onMeta = () => seek(winStart())

  const reverseTick = (ts) => {
    if (lastTs == null) lastTs = ts
    const dt = Math.min(0.05, (ts - lastTs) / 1000)
    lastTs = ts
    const t = video.currentTime - dt
    if (t <= tailStart()) {
      seek(tailStart())
      reversing = false
      lastTs = null
      video.play?.().catch(() => {}) // resume forward (native, smooth)
      return
    }
    seek(t)
    rafId = requestAnimationFrame(reverseTick)
  }

  const onTime = () => {
    if (!reversing && video.currentTime >= winEnd()) {
      reversing = true
      lastTs = null
      video.pause()
      rafId = requestAnimationFrame(reverseTick)
    }
  }

  video.addEventListener('loadedmetadata', onMeta)
  video.addEventListener('timeupdate', onTime)
  if (video.readyState >= 1) onMeta()

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    video.removeEventListener('loadedmetadata', onMeta)
    video.removeEventListener('timeupdate', onTime)
  }
}
