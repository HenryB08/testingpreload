import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Text } from '@react-three/drei'
import { FONT } from './font.js'

// Central glass orb with a placeholder "S". The "S" is isolated so it can later
// be swapped for the real Syntrex logo SVG (extruded or as a texture) without
// touching the orb material.
export default function Emblem({ reduced = false }) {
  const group = useRef()

  useFrame((state) => {
    if (!group.current || reduced) return
    const t = state.clock.elapsedTime
    group.current.rotation.y = Math.sin(t * 0.3) * 0.18
    group.current.position.y = Math.sin(t * 0.6) * 0.05
  })

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.1, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          transmission={1}
          thickness={0.6}
          roughness={0.05}
          ior={1.4}
          chromaticAberration={0.06}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={reduced ? 0 : 0.1}
          color="#cfe0ff"
          attenuationColor="#2f6bff"
          attenuationDistance={2}
        />
      </mesh>

      {/* Placeholder logo — swap for the real "S" SVG later. */}
      <Text
        font={FONT}
        position={[0, 0, 0.35]}
        fontSize={1.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.004}
        outlineColor="#2f6bff"
      >
        S
      </Text>
    </group>
  )
}
