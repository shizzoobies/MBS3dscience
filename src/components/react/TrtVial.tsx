import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, useGLTF, useTexture } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Hybrid TRT vial: Meshy image-to-3D for the photorealistic glass/cap/liquid
 * materials (regenerated from the actual MBS reference photo so the shape
 * matches), with a procedural cylinder shell overlay carrying the real
 * label texture so the text is pixel-perfect.
 *
 * The overlay shell sits just outside the body radius, covering whatever
 * garbled label Meshy invented underneath.
 */

const MODEL_PATH = '/models/trt-vial-base.glb'
const LABEL_TEXTURE = '/textures/trt-label.png'

// Animation — Meshy GLB native bounding box is ~0.82 x 1.91 x 0.82 units.
const BASE_SCALE = 1.6
const ENTRY_SCALE = 1.1
const ENTRY_Z = -10
const BASE_Z = 0
const ENTRY_DURATION = 1.3
// 0.75 turns during the fly-in, decelerating to a hard stop with the
// label facing camera once the section is fully on screen.
const ENTRY_TURNS = 0.75
const INITIAL_SPIN_Y = ENTRY_TURNS * Math.PI * 2
const TILT_X = -0.1

interface VialProps {
  focused: boolean
}

function Vial({ focused }: VialProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const focusStartRef = useRef<number | null>(null)
  const reducedRef = useRef(false)
  const { scene } = useGLTF(MODEL_PATH)
  const clone = useMemo(() => scene.clone(true), [scene])
  const labelTex = useTexture(LABEL_TEXTURE)

  // Compute the body's center and dimensions so the label overlay sits
  // on the cylindrical body section. Label center sits below the GLB's
  // centroid to account for the cap on top. Paper background wraps the
  // full 360 so the underlying Meshy texture stays hidden.
  const { labelY, labelRadius, paperRadius, labelHeight } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const bodyHeight = size.y * 0.85
    const bodyCenterY = center.y - size.y * 0.10
    const baseR = size.x / 2
    return {
      labelY: bodyCenterY,
      paperRadius: baseR * 1.015,
      labelRadius: baseR * 1.022,
      labelHeight: bodyHeight * 0.75,
    }
  }, [clone])

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

  // Label wrap chosen so the rendered surface aspect roughly matches the
  // cropped texture's 520x540 aspect ratio (text doesn't stretch).
  const labelTheta = useMemo(() => {
    // arc_length = labelRadius * theta; want arc_length ≈ labelHeight * (520/540)
    const targetArc = labelHeight * (520 / 540)
    return Math.max(0.6, Math.min(Math.PI, targetArc / labelRadius))
  }, [labelRadius, labelHeight])

  // Three.js CylinderGeometry: theta=0 places vertices at +Z (camera-facing
  // front). Center the arc on theta=0 so the label faces the camera.
  const labelThetaStart = -labelTheta / 2

  return (
    <group
      ref={groupRef}
      rotation={[TILT_X, INITIAL_SPIN_Y, 0]}
      scale={ENTRY_SCALE}
      position={[0, 0, ENTRY_Z]}
    >
      {/* Meshy GLB body */}
      <primitive object={clone} />

      {/* Paper background, full 360 wrap around the body, hides the Meshy
          underbrand on the back and sides */}
      <mesh position={[0, labelY, 0]}>
        <cylinderGeometry
          args={[paperRadius, paperRadius, labelHeight, 96, 1, true]}
        />
        <meshStandardMaterial
          color="#F4F1EA"
          roughness={0.85}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label arc with the real MBS texture, sits a hair proud of the paper */}
      <mesh position={[0, labelY, 0]}>
        <cylinderGeometry
          args={[
            labelRadius,
            labelRadius,
            labelHeight,
            96,
            1,
            true,
            labelThetaStart,
            labelTheta,
          ]}
        />
        <meshStandardMaterial
          map={labelTex}
          roughness={0.6}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
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
        camera={{ position: [0, 0, 6], fov: 32 }}
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
          position={[0, -1.5, 0]}
          opacity={0.34}
          scale={4.0}
          blur={2.8}
          far={2.0}
          resolution={256}
          color="#3C3836"
        />
      </Canvas>
    </div>
  )
}
