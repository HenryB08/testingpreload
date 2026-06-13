import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const ACCENT = '#2f6bff'
const STEEL = '#7f93c4'

// A plain metal ring.
function Ring({ radius, tube = 0.025, color = STEEL, roughness = 0.3, speed = 0.15, reduced }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current && !reduced) ref.current.rotation.z += dt * speed
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 16, 160]} />
      <meshStandardMaterial color={color} metalness={1} roughness={roughness} />
    </mesh>
  )
}

// A metal ring with teeth, reading as a "gear".
function GearRing({
  radius,
  tube = 0.03,
  teeth = 28,
  toothSize = 0.07,
  color = STEEL,
  speed = 0.12,
  reduced,
}) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current && !reduced) ref.current.rotation.z += dt * speed
  })

  const teethEls = useMemo(() => {
    const arr = []
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2
      arr.push({ a, x: Math.cos(a) * radius, y: Math.sin(a) * radius })
    }
    return arr
  }, [teeth, radius])

  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[radius, tube, 16, 200]} />
        <meshStandardMaterial color={color} metalness={1} roughness={0.28} />
      </mesh>
      {teethEls.map((t, i) => (
        <mesh key={i} position={[t.x, t.y, 0]} rotation={[0, 0, t.a]}>
          <boxGeometry args={[toothSize, toothSize * 0.6, tube * 2.2]} />
          <meshStandardMaterial color={color} metalness={1} roughness={0.28} />
        </mesh>
      ))}
    </group>
  )
}

// Concentric rings around the emblem. Slight tilt gives them depth; neighbours
// counter-rotate.
export default function Rings({ reduced = false }) {
  return (
    <group rotation={[0.5, 0, 0]}>
      <GearRing radius={1.45} teeth={32} toothSize={0.07} color={STEEL} speed={0.1} reduced={reduced} />
      <Ring radius={1.75} tube={0.02} color={ACCENT} speed={-0.18} reduced={reduced} />
      <GearRing radius={2.05} teeth={44} toothSize={0.06} color={STEEL} speed={0.07} reduced={reduced} />
      <Ring radius={2.35} tube={0.015} color={ACCENT} roughness={0.2} speed={-0.05} reduced={reduced} />
    </group>
  )
}
