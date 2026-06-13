import { Environment, Lightformer } from '@react-three/drei'
import Starfield from './Starfield.jsx'
import Rings from './Rings.jsx'
import Emblem from './Emblem.jsx'
import TextRing from './TextRing.jsx'
import Effects from './Effects.jsx'

// The full 3D scene. The Environment is built from Lightformers (no external
// HDR file) so the transmission orb has something to refract while keeping the
// preloader self-contained.
export default function Scene({ reduced = false }) {
  return (
    <>
      <color attach="background" args={['#060A16']} />
      <fog attach="fog" args={['#060A16', 9, 24]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-5, -3, 2]} intensity={2.4} color="#2f6bff" />

      <Starfield reduced={reduced} />
      <Rings reduced={reduced} />
      <TextRing reduced={reduced} />
      <Emblem reduced={reduced} />

      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 3, 4]} scale={[6, 6, 1]} color="#2f6bff" />
        <Lightformer intensity={1.5} position={[-4, -2, 2]} scale={[4, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1} position={[4, -1, -2]} scale={[4, 4, 1]} color="#9bb4ff" />
      </Environment>

      <Effects reduced={reduced} />
    </>
  )
}
