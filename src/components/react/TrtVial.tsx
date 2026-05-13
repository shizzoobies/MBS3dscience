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
// BASE_SCALE 2.6 with camera at z=6 brings the vial to a comfortable fill
// of the canvas.
const BASE_SCALE = 2.6
const ENTRY_SCALE = 1.8
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
  const labelTex = useTexture(LABEL_TEXTURE)

  // Compute the body's center and dimensions so the label overlay sits
  // exactly on the cylindrical body section.
  // The Meshy GLB came back as more of a pill-bottle silhouette — body
  // takes ~85% of total height, cap takes ~15% on top. Label fills the
  // middle 70% of the body, biased slightly upward toward where the
  // brand text sits on the real reference.
  const { labelY, labelRadius, labelHeight } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const bodyHeight = size.y * 0.85
    const bodyCenterY = center.y - size.y * 0.075
    return {
      labelY: bodyCenterY,
      // Slightly outside the body radius so the label sits proud of the
      // surface rather than z-fighting with it
      labelRadius: (size.x / 2) * 1.02,
      // Label covers the central 75% of the body
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

  // Label wrap chosen so the rendered surface aspect roughly matches the
  // cropped texture's 520x540 aspect ratio (text doesn't stretch).
  const labelTheta = useMemo(() => {
    // arc_length = labelRadius * theta; want arc_length ≈ labelHeight * (520/540)
    const targetArc = labelHeight * (520 / 540)
    return Math.max(0.6, Math.min(Math.PI, targetArc / labelRadius))
  }, [labelRadius, labelHeight])

  const labelThetaStart = Math.PI / 2 - labelTheta / 2

  return (
    <group ref={groupRef} scale={ENTRY_SCALE} position={[0, 0, ENTRY_Z]}>
      {/* Meshy GLB — photorealistic glass body, aluminum cap, amber liquid */}
      <primitive object={clone} />

      {/* Label overlay — partial cylinder shell with the real reference label
          texture, positioned just outside the body radius */}
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
