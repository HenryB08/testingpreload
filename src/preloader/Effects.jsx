import { useMemo } from 'react'
import { Vector2 } from 'three'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

// Post-processing stack. Under reduced motion we keep a soft bloom only and drop
// the more aggressive, movement-emphasising effects.
export default function Effects({ reduced = false }) {
  const caOffset = useMemo(() => new Vector2(0.0008, 0.0008), [])

  if (reduced) {
    return (
      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.6} mipmapBlur />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.45}
        luminanceSmoothing={0.2}
        mipmapBlur
      />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={caOffset} />
      <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
    </EffectComposer>
  )
}
