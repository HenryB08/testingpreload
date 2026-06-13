import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { FONT } from './font.js'

// An orbiting ring of text. Each character is placed around a circle so the
// whole band can rotate in its own (tilted) plane.
export default function TextRing({
  radius = 2.65,
  text = 'SYNTREX • AI AUTOMATION • ',
  reduced = false,
}) {
  const group = useRef()

  const chars = useMemo(() => text.repeat(3).toUpperCase().split(''), [text])

  useFrame((_, dt) => {
    if (group.current && !reduced) group.current.rotation.z -= dt * 0.08
  })

  const count = chars.length

  return (
    <group ref={group} rotation={[1.25, 0, 0]}>
      {chars.map((ch, i) => {
        const angle = (i / count) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return (
          <Text
            key={i}
            font={FONT}
            position={[x, y, 0]}
            rotation={[0, 0, angle - Math.PI / 2]}
            fontSize={0.22}
            color="#9bb4ff"
            anchorX="center"
            anchorY="middle"
          >
            {ch}
          </Text>
        )
      })}
    </group>
  )
}
