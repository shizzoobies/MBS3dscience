import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Free-standing lab-draw vial. Warm-cream tinted glass body with rust serum
 * filling the lower portion, a brushed-brass collar, and a sage seal cap.
 * Slow autonomous Y rotation, transparent canvas, contact shadow.
 */

function Vial() {
  const groupRef = useRef<THREE.Group>(null!)
  const reducedRef = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = mq.matches
    const onChange = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const speed = reducedRef.current ? 0 : 1
    groupRef.current.rotation.y += delta * 0.34 * speed
  })

  return (
    <group ref={groupRef}>
      {/* Glass body — cream-tinted transmission glass */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 2.8, 64]} />
        <meshPhysicalMaterial
          color="#EAE2D2"
          roughness={0.12}
          metalness={0.05}
          transmission={0.75}
          thickness={0.5}
          ior={1.45}
          attenuationColor="#D9C7A8"
          attenuationDistance={1.4}
          transparent
          opacity={0.88}
          depthWrite={false}
        />
      </mesh>

      {/* Serum — warm rust, fills the lower portion of the body */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 1.6, 64]} />
        <meshStandardMaterial
          color="#B85A4A"
          emissive="#5A2820"
          emissiveIntensity={0.18}
          roughness={0.48}
          metalness={0.12}
        />
      </mesh>

      {/* Label band — sage hairline around the body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.508, 0.508, 0.08, 64]} />
        <meshStandardMaterial
          color="#7D8C7B"
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {/* Brushed-brass collar above the glass */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <cylinderGeometry args={[0.54, 0.52, 0.42, 64]} />
        <meshStandardMaterial
          color="#B8956A"
          roughness={0.32}
          metalness={0.78}
        />
      </mesh>

      {/* Sage seal disc on top */}
      <mesh position={[0, 1.86, 0]} castShadow>
        <cylinderGeometry args={[0.56, 0.56, 0.08, 64]} />
        <meshStandardMaterial
          color="#7D8C7B"
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>
    </group>
  )
}

export default function LabVial() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 30)
    return () => window.clearTimeout(t)
  }, [])

  if (!mounted) return null

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7.5], fov: 32 }}
      gl={{
        antialias: true,
        alpha: true,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 5, 4]} intensity={1.4} color="#FFE4B5" castShadow />
      <directionalLight position={[-3, -1, -2]} intensity={0.55} color="#B5C5A8" />
      <pointLight position={[0, 0, 4]} intensity={0.35} color="#E8C295" distance={9} />
      <Vial />
      <ContactShadows
        position={[0, -1.85, 0]}
        opacity={0.34}
        scale={4.2}
        blur={2.8}
        far={2.0}
        resolution={256}
        color="#3C3836"
      />
    </Canvas>
  )
}
