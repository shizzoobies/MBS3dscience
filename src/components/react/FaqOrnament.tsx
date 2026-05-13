import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Decorative 3D ornament that lives inside the FAQ heading column on every
 * ServicePage. Replaces the previous static sig-leaf.jpg.
 *
 * Editorial intent: a slow-tumbling brushed-brass leaf form with a soft sage
 * rim from the secondary fill light. Restrained motion, no scroll coupling,
 * honors prefers-reduced-motion. Fits inside the existing 220px square frame.
 */

function buildLeafShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, 1.05)
  s.bezierCurveTo(0.62, 0.78, 0.55, -0.55, 0, -1.05)
  s.bezierCurveTo(-0.55, -0.55, -0.62, 0.78, 0, 1.05)
  return s
}

function Leaf() {
  const meshRef = useRef<THREE.Mesh>(null!)
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

  const geometry = useMemo(() => {
    const shape = buildLeafShape()
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      bevelSegments: 5,
      curveSegments: 24,
    })
    geo.center()
    return geo
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const speed = reducedRef.current ? 0 : 1
    meshRef.current.rotation.y += delta * 0.45 * speed
    meshRef.current.rotation.x = Math.sin(meshRef.current.rotation.y * 0.7) * 0.22
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#B8956A"
        roughness={0.34}
        metalness={0.72}
      />
    </mesh>
  )
}

export default function FaqOrnament() {
  // Defer canvas mount one frame after the island hydrates so the warm
  // surface-warm background paints first (avoids the canvas flashing in
  // before fonts/styles settle on the rest of the page).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 30)
    return () => window.clearTimeout(t)
  }, [])

  if (!mounted) return null

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3.2], fov: 38 }}
      gl={{
        antialias: true,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#EAE7E0']} />
      <ambientLight intensity={0.35} />
      {/* Warm key from upper-right gives the brass its glint */}
      <directionalLight position={[3, 3, 4]} intensity={1.4} color="#FFE4B5" />
      {/* Cool sage rim from the back-left */}
      <directionalLight position={[-3, -1, -2]} intensity={0.55} color="#B5C5A8" />
      <Leaf />
    </Canvas>
  )
}
