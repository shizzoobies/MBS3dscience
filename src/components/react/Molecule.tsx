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

const PULSE_COLOR = new THREE.Color('#FFE4B5')
const BASE_SCALE = 1.2
const ENTRY_SCALE = 0.7
const ENTRY_Z = -10   // group starts this far behind origin (away from camera)
const BASE_Z = 0
const ENTRY_DURATION = 1.0

interface ClusterProps {
  focused: boolean
}

function Cluster({ focused }: ClusterProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const centerRef = useRef<THREE.Mesh>(null!)
  const bondRefs = useRef<(THREE.Mesh | null)[]>([])
  const v1Ref = useRef<THREE.Mesh>(null!)
  const v3Ref = useRef<THREE.Mesh>(null!)
  const reducedRef = useRef(false)
  const focusStartRef = useRef<number | null>(null)

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

  useFrame((state) => {
    if (!groupRef.current) return
    if (reducedRef.current) {
      groupRef.current.scale.setScalar(BASE_SCALE)
      groupRef.current.position.z = BASE_Z
      return
    }

    const t = state.clock.elapsedTime

    // Entry animation — the molecule flies in from depth. Animated entirely
    // in 3D space via vertex transforms and a group position lerp, so the
    // canvas layer never has to re-rasterize. Perspective handles most of
    // the "growing" sensation, scale adds a subtle additional bloom.
    if (focused) {
      if (focusStartRef.current === null) focusStartRef.current = t
      const elapsed = t - focusStartRef.current
      const progress = Math.min(elapsed / ENTRY_DURATION, 1)
      // ease-out cubic — decelerates as the molecule settles into place
      const eased = 1 - Math.pow(1 - progress, 3)
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(ENTRY_SCALE, BASE_SCALE, eased))
      groupRef.current.position.z = THREE.MathUtils.lerp(ENTRY_Z, BASE_Z, eased)
    } else {
      groupRef.current.scale.setScalar(ENTRY_SCALE)
      groupRef.current.position.z = ENTRY_Z
    }

    // Museum-display tumble — three sinusoidal axes at different periods so
    // the rotation feels hand-animated, not like a turntable.
    groupRef.current.rotation.y = t * 0.28 + Math.sin(t * 0.45) * 0.18
    groupRef.current.rotation.x = Math.sin(t * 0.36) * 0.36
    groupRef.current.rotation.z = Math.cos(t * 0.24) * 0.14

    // Central atom breathes
    if (centerRef.current) {
      const pulse = 1 + Math.sin(t * 1.15) * 0.045
      centerRef.current.scale.setScalar(pulse)
    }

    // The two second-shell branches sway a touch — small angular offset
    // on the V1 and V3 group axes, so the outer atoms hang gently rather
    // than feeling welded in place.
    if (v1Ref.current) {
      v1Ref.current.position.copy(atoms.outer1)
      v1Ref.current.position.x += Math.sin(t * 0.9) * 0.04
      v1Ref.current.position.y += Math.cos(t * 0.82) * 0.04
    }
    if (v3Ref.current) {
      v3Ref.current.position.copy(atoms.outer2)
      v3Ref.current.position.x += Math.sin(t * 0.78 + 1.4) * 0.04
      v3Ref.current.position.y += Math.cos(t * 0.91 + 1.4) * 0.04
    }

    // Cascading emissive pulse along the bonds — like signal flow.
    // Each bond is offset in phase so the pulse appears to travel
    // around the molecule.
    bondRefs.current.forEach((bond, i) => {
      if (!bond) return
      const phase = (i / bonds.length) * Math.PI * 2
      const wave = Math.sin(t * 1.6 - phase)
      const intensity = Math.max(0, wave) * 0.65
      const mat = bond.material as THREE.MeshStandardMaterial
      mat.emissive.copy(PULSE_COLOR)
      mat.emissiveIntensity = intensity
    })
  })

  return (
    <group ref={groupRef} scale={ENTRY_SCALE} position={[0, 0, ENTRY_Z]}>
      {/* Central atom — brushed brass with a slow breathing pulse */}
      <mesh ref={centerRef} castShadow>
        <sphereGeometry args={[0.7, 40, 40]} />
        <meshStandardMaterial color="#B8956A" roughness={0.36} metalness={0.7} />
      </mesh>

      {/* Inner shell — two sage, two rust at tetrahedral vertices */}
      <mesh position={atoms.v1} castShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#7D8C7B" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh position={atoms.v2} castShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#7D8C7B" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh position={atoms.v3} castShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#C27A63" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh position={atoms.v4} castShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#C27A63" roughness={0.5} metalness={0.18} />
      </mesh>

      {/* Second shell — smaller, gently swaying off the V1 and V3 axes */}
      <mesh ref={v1Ref} position={atoms.outer1} castShadow>
        <sphereGeometry args={[0.28, 28, 28]} />
        <meshStandardMaterial color="#A1AC9F" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh ref={v3Ref} position={atoms.outer2} castShadow>
        <sphereGeometry args={[0.28, 28, 28]} />
        <meshStandardMaterial color="#D08F7A" roughness={0.55} metalness={0.15} />
      </mesh>

      {/* Bonds — brushed brass cylinders, each carrying a phase-offset
          emissive pulse to suggest signal flow through the molecule. */}
      {bonds.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => {
            bondRefs.current[i] = el
          }}
          position={b.position}
          quaternion={b.quaternion}
          castShadow
        >
          <cylinderGeometry args={[0.09, 0.09, b.length, 16]} />
          <meshStandardMaterial color="#B8956A" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export default function Molecule() {
  const [mounted, setMounted] = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 30)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!wrapperRef.current) return
    const el = wrapperRef.current
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFocused(true)
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.25, rootMargin: '0px 0px -120px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!mounted) return null

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
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
        <Cluster focused={focused} />
        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.32}
          scale={5.0}
          blur={2.8}
          far={2.4}
          resolution={256}
          color="#3C3836"
        />
      </Canvas>
    </div>
  )
}
