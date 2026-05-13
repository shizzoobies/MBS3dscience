import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, useGLTF, Environment } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Free-standing TRT injection vial — Meshy-generated GLB model with the
 * same entry animation pattern as the Molecule scene:
 *   - Group flies in from z=-10 to z=0 on viewport entry
 *   - Scale lerps ENTRY_SCALE → BASE_SCALE in 3D space (no CSS scale on
 *     the canvas, so the animation stays silky on the GPU)
 *   - Slow autonomous Y rotation keeps it alive while resting
 *
 * Environment preset adds HDRI-based reflections so the polished
 * aluminum cap and tinted glass body read correctly.
 */

const MODEL_PATH = '/models/trt-vial.glb'
const BASE_SCALE = 4.5
const ENTRY_SCALE = 2.5
const ENTRY_Z = -10
const BASE_Z = 0
const ENTRY_DURATION = 1.0

interface VialProps {
  focused: boolean
}

function Vial({ focused }: VialProps) {
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

    // Slow, dignified Y rotation while at rest
    groupRef.current.rotation.y += delta * 0.32
  })

  return (
    <group ref={groupRef} scale={ENTRY_SCALE} position={[0, 0, ENTRY_Z]}>
      <primitive object={clone} />
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
        camera={{ position: [0, 0, 8], fov: 32 }}
        gl={{
          antialias: true,
          alpha: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 4]} intensity={1.2} color="#FFE4B5" castShadow />
        <directionalLight position={[-3, -1, -2]} intensity={0.45} color="#B5C5A8" />
        <Environment preset="apartment" />
        <Vial focused={focused} />
        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.34}
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
