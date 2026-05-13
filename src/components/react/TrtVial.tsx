import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, useTexture } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Procedural MBS Medical TRT injection vial. The label is the actual
 * /textures/trt-label.png cropped out of the reference photo, applied
 * to a partial cylinder shell wrapped around the front of the vial —
 * so the text is pixel-perfect rather than Meshy's best guess at it.
 *
 * Glass body, amber liquid filling the lower portion, aluminum crimp
 * cap on top. Same fly-in entry animation pattern as the rest of the
 * scene library.
 */

const LABEL_TEXTURE = '/textures/trt-label.png'
const BASE_SCALE = 2.0
const ENTRY_SCALE = 1.2
const ENTRY_Z = -10
const BASE_Z = 0
const ENTRY_DURATION = 1.0

// Vial body proportions (pre-scale)
const BODY_RADIUS = 0.7
const BODY_HEIGHT = 2.4
const LABEL_HEIGHT = 1.45
// Label arc wraps just over a third of the circumference, chosen so the
// rendered surface aspect (~1:1) matches the cropped texture's 520x540 aspect
// and the text doesn't get horizontally stretched.
const LABEL_THETA = 2.07
const LABEL_THETA_START = Math.PI / 2 - LABEL_THETA / 2

interface VialProps {
  focused: boolean
}

function Vial({ focused }: VialProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const focusStartRef = useRef<number | null>(null)
  const reducedRef = useRef(false)
  const labelTex = useTexture(LABEL_TEXTURE)

  useEffect(() => {
    if (labelTex) {
      labelTex.colorSpace = THREE.SRGBColorSpace
      labelTex.anisotropy = 16
      labelTex.needsUpdate = true
    }
  }, [labelTex])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = mq.matches
    const onChange = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    if (reducedRef.current) {
      groupRef.current.scale.setScalar(BASE_SCALE)
      groupRef.current.position.z = BASE_Z
      return
    }

    const t = state.clock.elapsedTime

    if (focused) {
      if (focusStartRef.current === null) focusStartRef.current = t
      const elapsed = t - focusStartRef.current
      const progress = Math.min(elapsed / ENTRY_DURATION, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(ENTRY_SCALE, BASE_SCALE, eased))
      groupRef.current.position.z = THREE.MathUtils.lerp(ENTRY_Z, BASE_Z, eased)
    } else {
      groupRef.current.scale.setScalar(ENTRY_SCALE)
      groupRef.current.position.z = ENTRY_Z
    }

    groupRef.current.rotation.y += delta * 0.25
  })

  return (
    <group ref={groupRef} scale={ENTRY_SCALE} position={[0, 0, ENTRY_Z]}>
      {/* Glass body — clear with transmission */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, BODY_HEIGHT, 64]} />
        <meshPhysicalMaterial
          color="#f0f3f7"
          roughness={0.08}
          metalness={0.0}
          transmission={0.92}
          thickness={0.5}
          ior={1.5}
          attenuationColor="#dfeaf2"
          attenuationDistance={2}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Amber testosterone-in-oil liquid filling the lower portion */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[BODY_RADIUS - 0.04, BODY_RADIUS - 0.04, 1.45, 64]} />
        <meshStandardMaterial
          color="#d3a04b"
          emissive="#5a3a14"
          emissiveIntensity={0.15}
          roughness={0.45}
          metalness={0.18}
        />
      </mesh>

      {/* Label — partial cylinder shell wrapping the front of the body
          with the actual cropped reference label texture applied */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry
          args={[
            BODY_RADIUS + 0.005,
            BODY_RADIUS + 0.005,
            LABEL_HEIGHT,
            96,
            1,
            true,
            LABEL_THETA_START,
            LABEL_THETA,
          ]}
        />
        <meshStandardMaterial
          map={labelTex}
          roughness={0.65}
          metalness={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rubber stopper just under the cap, dark gray */}
      <mesh position={[0, 1.27, 0]} castShadow>
        <cylinderGeometry args={[BODY_RADIUS - 0.02, BODY_RADIUS - 0.04, 0.16, 64]} />
        <meshStandardMaterial color="#3a3a3e" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Aluminum crimp cap — main barrel */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <cylinderGeometry args={[BODY_RADIUS + 0.06, BODY_RADIUS + 0.03, 0.32, 64]} />
        <meshStandardMaterial color="#b8b9bd" metalness={0.85} roughness={0.32} />
      </mesh>

      {/* Aluminum cap top disc (slightly inset) */}
      <mesh position={[0, 1.66, 0]} castShadow>
        <cylinderGeometry args={[BODY_RADIUS - 0.02, BODY_RADIUS + 0.04, 0.06, 64]} />
        <meshStandardMaterial color="#a4a5a9" metalness={0.92} roughness={0.28} />
      </mesh>
    </group>
  )
}

export default function TrtVial() {
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
        camera={{ position: [0, 0, 11], fov: 32 }}
        gl={{
          antialias: true,
          alpha: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 5, 4]} intensity={1.3} color="#FFE4B5" castShadow />
        <directionalLight position={[-3, -1, -2]} intensity={0.5} color="#B5C5A8" />
        <Environment preset="apartment" />
        <Vial focused={focused} />
        <ContactShadows
          position={[0, -2.6, 0]}
          opacity={0.34}
          scale={6.0}
          blur={2.8}
          far={3.0}
          resolution={256}
          color="#3C3836"
        />
      </Canvas>
    </div>
  )
}
