import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * A canonical DNA double-helix in the warm site palette: two brushed-brass
 * strands with alternating sage and rust base-pair rungs between them.
 * Renders free-standing on the feature-row's section background — no card
 * framing, just a soft contact shadow to anchor the form.
 */

const HELIX_RADIUS = 0.7
const HELIX_HEIGHT = 4.0
const TURNS = 3
const STRAND_SAMPLES = 220
const RUNG_COUNT = 13

function buildStrand(phase: number): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= STRAND_SAMPLES; i++) {
    const t = i / STRAND_SAMPLES
    const angle = t * Math.PI * 2 * TURNS + phase
    pts.push(
      new THREE.Vector3(
        Math.cos(angle) * HELIX_RADIUS,
        (t - 0.5) * HELIX_HEIGHT,
        Math.sin(angle) * HELIX_RADIUS,
      ),
    )
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
}

interface Rung {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  length: number
}

function buildRungs(
  strandA: THREE.CatmullRomCurve3,
  strandB: THREE.CatmullRomCurve3,
): Rung[] {
  const up = new THREE.Vector3(0, 1, 0)
  return Array.from({ length: RUNG_COUNT }, (_, i) => {
    const t = (i + 0.5) / RUNG_COUNT
    const a = strandA.getPointAt(t)
    const b = strandB.getPointAt(t)
    const mid = new THREE.Vector3().lerpVectors(a, b, 0.5)
    const dir = new THREE.Vector3().subVectors(b, a).normalize()
    const length = a.distanceTo(b)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir)
    return { position: mid, quaternion, length }
  })
}

function Helix() {
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

  const { strandA, strandB, tubeA, tubeB, rungs } = useMemo(() => {
    const a = buildStrand(0)
    const b = buildStrand(Math.PI)
    return {
      strandA: a,
      strandB: b,
      tubeA: new THREE.TubeGeometry(a, 280, 0.075, 14, false),
      tubeB: new THREE.TubeGeometry(b, 280, 0.075, 14, false),
      rungs: buildRungs(a, b),
    }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const speed = reducedRef.current ? 0 : 1
    groupRef.current.rotation.y += delta * 0.28 * speed
  })

  return (
    <group ref={groupRef}>
      <mesh geometry={tubeA} castShadow>
        <meshStandardMaterial
          color="#B8956A"
          roughness={0.34}
          metalness={0.72}
        />
      </mesh>
      <mesh geometry={tubeB} castShadow>
        <meshStandardMaterial
          color="#B8956A"
          roughness={0.34}
          metalness={0.72}
        />
      </mesh>
      {rungs.map((r, i) => (
        <mesh
          key={i}
          position={r.position}
          quaternion={r.quaternion}
          castShadow
        >
          <cylinderGeometry args={[0.045, 0.045, r.length, 14]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#7D8C7B' : '#C27A63'}
            roughness={0.48}
            metalness={0.18}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function DnaHelix() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 30)
    return () => window.clearTimeout(t)
  }, [])

  if (!mounted) return null

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.2, 7.5], fov: 32 }}
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
      <Helix />
      <ContactShadows
        position={[0, -2.25, 0]}
        opacity={0.34}
        scale={5.5}
        blur={3.0}
        far={2.5}
        resolution={256}
        color="#3C3836"
      />
    </Canvas>
  )
}
