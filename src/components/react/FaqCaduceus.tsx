import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Decorative Caduceus model rendered in the FAQ heading column.
 * Mirrors the entry pattern from TrtVial: scroll-triggered fly-in
 * from behind with a 3/4 turn spin-down to a fixed final orientation,
 * slight forward tilt at rest, no continuous spin.
 */

const MODEL_PATH = '/models/caduceus.glb'

const BASE_SCALE = 1.4
const ENTRY_SCALE = 0.92
const ENTRY_Z = -6
const BASE_Z = 0
const ENTRY_DURATION = 2.8
const ENTRY_TURNS = 0.6
const INITIAL_SPIN_Y = ENTRY_TURNS * Math.PI * 2
const TILT_X = -0.05

interface CaduceusProps {
  focused: boolean
}

function Caduceus({ focused }: CaduceusProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const focusStartRef = useRef<number | null>(null)
  const reducedRef = useRef(false)
  const { scene } = useGLTF(MODEL_PATH)
  const clone = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = mq.matches
    const onChange = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    if (reducedRef.current) {
      groupRef.current.scale.setScalar(BASE_SCALE)
      groupRef.current.position.z = BASE_Z
      groupRef.current.rotation.set(TILT_X, 0, 0)
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
      groupRef.current.rotation.y = THREE.MathUtils.lerp(INITIAL_SPIN_Y, 0, eased)
    } else {
      groupRef.current.scale.setScalar(ENTRY_SCALE)
      groupRef.current.position.z = ENTRY_Z
      groupRef.current.rotation.y = INITIAL_SPIN_Y
    }
  })

  return (
    <group
      ref={groupRef}
      rotation={[TILT_X, INITIAL_SPIN_Y, 0]}
      scale={ENTRY_SCALE}
      position={[0, 0, ENTRY_Z]}
    >
      <primitive object={clone} />
    </group>
  )
}

export default function FaqCaduceus() {
  const [mounted, setMounted] = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 30)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!mounted) return
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
  }, [mounted])

  if (!mounted) return null

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.5], fov: 32 }}
        gl={{
          antialias: true,
          alpha: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 3]} intensity={1.1} color="#FFF6E6" castShadow />
        <directionalLight position={[-3, -1, -2]} intensity={0.4} color="#B5C5A8" />
        <Environment preset="apartment" />
        <Caduceus focused={focused} />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.28}
          scale={3.5}
          blur={2.4}
          far={2.0}
          resolution={256}
          color="#3C3836"
        />
      </Canvas>
    </div>
  )
}
