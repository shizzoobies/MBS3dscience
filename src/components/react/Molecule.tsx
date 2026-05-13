import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Stylized molecular cluster — a brushed-brass core surrounded by four
 * inner atoms in a tetrahedral arrangement (two sage, two rust) and two
 * second-shell atoms. Six bonds connect them. Reads as "hormone / steroid
 * molecule" without being a literal model of any specific compound.
 *
 * Used on the mens-health feature row for the TRT-evaluation story.
 */

const _up = new THREE.Vector3(0, 1, 0)

interface BondTransform {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  length: number
}

function buildBond(a: THREE.Vector3, b: THREE.Vector3): BondTransform {
  const mid = new THREE.Vector3().lerpVectors(a, b, 0.5)
  const dir = new THREE.Vector3().subVectors(b, a).normalize()
  const length = a.distanceTo(b)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(_up, dir)
  return { position: mid, quaternion, length }
}

function Cluster() {
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

  // Atom positions: central + 4 tetrahedral inner + 2 second-shell
  const atoms = useMemo(() => {
    const tetraScale = 1.5 / Math.sqrt(3)
    const v1 = new THREE.Vector3(1, 1, 1).multiplyScalar(tetraScale)
    const v2 = new THREE.Vector3(-1, -1, 1).multiplyScalar(tetraScale)
    const v3 = new THREE.Vector3(-1, 1, -1).multiplyScalar(tetraScale)
    const v4 = new THREE.Vector3(1, -1, -1).multiplyScalar(tetraScale)
    const outer1 = v1.clone().normalize().multiplyScalar(2.1)
    const outer2 = v3.clone().normalize().multiplyScalar(2.1)
    return { v1, v2, v3, v4, outer1, outer2 }
  }, [])

  const bonds = useMemo(() => {
    const center = new THREE.Vector3(0, 0, 0)
    return [
      buildBond(center, atoms.v1),
      buildBond(center, atoms.v2),
      buildBond(center, atoms.v3),
      buildBond(center, atoms.v4),
      buildBond(atoms.v1, atoms.outer1),
      buildBond(atoms.v3, atoms.outer2),
    ]
  }, [atoms])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const speed = reducedRef.current ? 0 : 1
    groupRef.current.rotation.y += delta * 0.3 * speed
    groupRef.current.rotation.x = Math.sin(groupRef.current.rotation.y * 0.4) * 0.16
  })

  return (
    <group ref={groupRef} scale={0.85}>
      {/* Central atom — brushed brass */}
      <mesh castShadow>
        <sphereGeometry args={[0.5, 36, 36]} />
        <meshStandardMaterial color="#B8956A" roughness={0.36} metalness={0.7} />
      </mesh>

      {/* Inner shell — two sage, two rust at tetrahedral vertices */}
      <mesh position={atoms.v1} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#7D8C7B" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh position={atoms.v2} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#7D8C7B" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh position={atoms.v3} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#C27A63" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh position={atoms.v4} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#C27A63" roughness={0.5} metalness={0.18} />
      </mesh>

      {/* Second shell — smaller, off the V1 and V3 axes */}
      <mesh position={atoms.outer1} castShadow>
        <sphereGeometry args={[0.22, 28, 28]} />
        <meshStandardMaterial color="#A1AC9F" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={atoms.outer2} castShadow>
        <sphereGeometry args={[0.22, 28, 28]} />
        <meshStandardMaterial color="#D08F7A" roughness={0.55} metalness={0.15} />
      </mesh>

      {/* Bonds — brushed brass cylinders */}
      {bonds.map((b, i) => (
        <mesh key={i} position={b.position} quaternion={b.quaternion} castShadow>
          <cylinderGeometry args={[0.06, 0.06, b.length, 14]} />
          <meshStandardMaterial color="#B8956A" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export default function Molecule() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 30)
    return () => window.clearTimeout(t)
  }, [])

  if (!mounted) return null

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 32 }}
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
      <Cluster />
      <ContactShadows
        position={[0, -2.0, 0]}
        opacity={0.32}
        scale={4.8}
        blur={3.0}
        far={2.4}
        resolution={256}
        color="#3C3836"
      />
    </Canvas>
  )
}
