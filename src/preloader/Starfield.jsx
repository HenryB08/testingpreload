import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// A spherical shell of points behind the emblem. Drifts slowly unless the user
// prefers reduced motion.
export default function Starfield({ count = 1400, reduced = false }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 16 + Math.random() * 44
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame((_, dt) => {
    if (ref.current && !reduced) {
      ref.current.rotation.y += dt * 0.01
      ref.current.rotation.x += dt * 0.004
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#9bb4ff"
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}
