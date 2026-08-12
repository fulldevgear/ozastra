import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import * as THREE from 'three'

import { getDocumentTheme, subscribeToTheme } from '../../lib/theme'
import type { Theme } from '../../lib/theme'
import { resolveStoryPosition } from './orbital-story'

type MotionState = {
  pointerX: number
  pointerY: number
  story: number
}

const storyStages = [
  'hero',
  'selected-work',
  'web',
  'ai',
  'saas',
  'mobile',
  'process',
  'convergence',
] as const

type ServiceRingProps = {
  color: string
  index: number
  isLight: boolean
  motion: React.RefObject<MotionState>
  radius: number
  rotation: [number, number, number]
}

const rings: Omit<ServiceRingProps, 'color' | 'isLight' | 'motion'>[] = [
  {
    index: 0,
    radius: 1.48,
    rotation: [1.18, 0.12, 0.2],
  },
  {
    index: 1,
    radius: 1.67,
    rotation: [0.72, 0.58, -0.42],
  },
  {
    index: 2,
    radius: 1.87,
    rotation: [1.38, -0.46, 0.48],
  },
  {
    index: 3,
    radius: 2.08,
    rotation: [0.5, -0.18, 0.82],
  },
]

type OrbitalPalette = {
  accent: string
  ambient: string
  astral: string
  foreground: string
  rings: [string, string, string, string]
}

const orbitalPalettes: Record<Theme, OrbitalPalette> = {
  dark: {
    accent: '#5b7cff',
    ambient: '#a7b1d6',
    astral: '#9b7bff',
    foreground: '#f3f0e8',
    rings: ['#f3f0e8', '#5b7cff', '#9b7bff', '#969cac'],
  },
  light: {
    accent: '#3457d5',
    ambient: '#dfe4f5',
    astral: '#7556d8',
    foreground: '#242a36',
    rings: ['#3b4351', '#3457d5', '#7556d8', '#687083'],
  },
}

function damp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta))
}

function ServiceRing({
  color,
  index,
  isLight,
  motion,
  radius,
  rotation,
}: ServiceRingProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const viewportWidth = useThree((state) => state.viewport.width)
  const baseRotation = useMemo(() => new THREE.Euler(...rotation), [rotation])

  useFrame(({ clock }, delta) => {
    if (!mesh.current) return

    const progress = motion.current.story
    const pointerX = motion.current.pointerX
    const pointerY = motion.current.pointerY
    const departure = THREE.MathUtils.smoothstep(progress, 0.1, 0.34)
    const returnToCore = 1 - THREE.MathUtils.smoothstep(progress, 0.72, 0.98)
    const separation = departure * returnToCore
    const stageCenter = (index + 2) / (storyStages.length - 1)
    const focus = Math.max(0, 1 - Math.abs(progress - stageCenter) * 9)
    const spatialScale = viewportWidth < 6 ? 0.58 : viewportWidth < 9 ? 0.8 : 1
    const direction = index % 2 === 0 ? 1 : -1
    const time = clock.getElapsedTime()

    mesh.current.position.x = damp(
      mesh.current.position.x,
      (separation * direction * (0.3 + index * 0.09) +
        focus * direction * 0.14) *
        spatialScale,
      2.4,
      delta,
    )
    mesh.current.position.y = damp(
      mesh.current.position.y,
      separation * (index - 1.5) * 0.16 * spatialScale,
      2.4,
      delta,
    )
    mesh.current.position.z = damp(
      mesh.current.position.z,
      (separation * (index - 1.5) * 0.21 + focus * 0.08) * spatialScale,
      2.4,
      delta,
    )
    mesh.current.rotation.x = damp(
      mesh.current.rotation.x,
      baseRotation.x + pointerY * 0.1 + Math.sin(time * 0.16 + index) * 0.025,
      2.8,
      delta,
    )
    mesh.current.rotation.y = damp(
      mesh.current.rotation.y,
      baseRotation.y + pointerX * 0.12 + time * direction * 0.018,
      2.8,
      delta,
    )
    mesh.current.rotation.z = damp(
      mesh.current.rotation.z,
      baseRotation.z + pointerX * pointerY * 0.06,
      2.8,
      delta,
    )
    mesh.current.scale.setScalar(
      damp(mesh.current.scale.x, 1 + focus * 0.035, 2.8, delta),
    )
  })

  return (
    <mesh ref={mesh} rotation={rotation}>
      <torusGeometry args={[radius, 0.012 + index * 0.002, 8, 128]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={index === 1 ? (isLight ? 0.34 : 0.7) : 0.16}
        metalness={0.85}
        roughness={0.24}
        transparent
        opacity={index === 3 ? (isLight ? 0.58 : 0.46) : isLight ? 0.88 : 0.76}
      />
    </mesh>
  )
}

function Core({
  accent,
  isLight,
  motion,
}: {
  accent: string
  isLight: boolean
  motion: React.RefObject<MotionState>
}) {
  const core = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshPhysicalMaterial>(null)

  useFrame(({ clock }, delta) => {
    if (!core.current) return

    const time = clock.getElapsedTime()
    const pointerX = motion.current.pointerX
    const pointerY = motion.current.pointerY
    const convergence = THREE.MathUtils.smoothstep(
      motion.current.story,
      0.78,
      1,
    )
    const breath = 1 + Math.sin(time * 0.55) * 0.018 + convergence * 0.025

    core.current.scale.setScalar(damp(core.current.scale.x, breath, 2.2, delta))
    core.current.rotation.y = damp(
      core.current.rotation.y,
      time * 0.045 + pointerX * 0.1,
      2,
      delta,
    )
    core.current.rotation.x = damp(
      core.current.rotation.x,
      pointerY * 0.08,
      2,
      delta,
    )
    if (material.current) {
      material.current.emissiveIntensity = damp(
        material.current.emissiveIntensity,
        0.03 + convergence * 0.22,
        2,
        delta,
      )
    }
  })

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.06, 4]} />
        <meshPhysicalMaterial
          ref={material}
          color="#080b12"
          clearcoat={0.9}
          clearcoatRoughness={0.16}
          envMapIntensity={0.75}
          metalness={0.74}
          roughness={0.2}
          emissive={accent}
          emissiveIntensity={0.03}
        />
      </mesh>
      <mesh scale={1.075}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={accent}
          side={THREE.BackSide}
          transparent
          opacity={isLight ? 0.075 : 0.045}
        />
      </mesh>
    </group>
  )
}

function OrbitalMarkers({
  motion,
  palette,
}: {
  motion: React.RefObject<MotionState>
  palette: OrbitalPalette
}) {
  const group = useRef<THREE.Group>(null)
  const positions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2
        const radius = 2.25 + (index % 3) * 0.08
        return [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.42,
          Math.sin(angle * 2) * 0.16,
        ] as [number, number, number]
      }),
    [],
  )

  useFrame((_, delta) => {
    if (!group.current) return
    const progress = motion.current.story
    const alignment = Math.sin(Math.min(1, progress) * Math.PI)
    group.current.rotation.y = damp(
      group.current.rotation.y,
      alignment * 0.35,
      2.2,
      delta,
    )
  })

  return (
    <group ref={group} rotation={[0.28, 0, 0.12]}>
      {positions.map((position, index) => (
        <mesh key={position.join('-')} position={position}>
          <sphereGeometry args={[index % 4 === 0 ? 0.032 : 0.018, 12, 12]} />
          <meshBasicMaterial
            color={index % 4 === 0 ? palette.accent : palette.foreground}
            transparent
            opacity={index % 4 === 0 ? 0.9 : 0.42}
          />
        </mesh>
      ))}
    </group>
  )
}

function OrbitalScene({
  motion,
  theme,
}: {
  motion: React.RefObject<MotionState>
  theme: Theme
}) {
  const assembly = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  const palette = orbitalPalettes[theme]
  const isLight = theme === 'light'

  useFrame((_, delta) => {
    if (!assembly.current) return

    const pointerX = motion.current.pointerX
    const pointerY = motion.current.pointerY
    const convergence = THREE.MathUtils.smoothstep(
      motion.current.story,
      0.78,
      1,
    )
    const wideTargetX = viewport.width > 8 ? viewport.width * 0.22 : 0
    const baseTargetY = viewport.width > 8 ? 0.15 : -0.25
    const targetX = THREE.MathUtils.lerp(wideTargetX, 0, convergence)
    const targetY = THREE.MathUtils.lerp(baseTargetY, 0.35, convergence)

    assembly.current.position.x = damp(
      assembly.current.position.x,
      targetX + pointerX * 0.08,
      2.2,
      delta,
    )
    assembly.current.position.y = damp(
      assembly.current.position.y,
      targetY + pointerY * 0.06,
      2.2,
      delta,
    )
  })

  return (
    <>
      <QualityController />
      <WebGLLifecycle />
      <VisualTestController />
      <ambientLight color={palette.ambient} intensity={isLight ? 0.48 : 0.34} />
      <spotLight
        angle={0.46}
        color={isLight ? '#fffdf7' : palette.foreground}
        intensity={isLight ? 30 : 34}
        penumbra={1}
        position={[4, 5, 6]}
      />
      <pointLight
        color={palette.accent}
        intensity={isLight ? 13 : 18}
        position={[-4, -2, 3]}
      />
      <pointLight
        color={palette.astral}
        intensity={isLight ? 5 : 8}
        position={[3, -4, -2]}
      />

      <group ref={assembly} scale={viewport.width < 6 ? 0.68 : 0.92}>
        <Core accent={palette.accent} isLight={isLight} motion={motion} />
        {rings.map((ring) => (
          <ServiceRing
            key={ring.index}
            {...ring}
            color={palette.rings[ring.index]}
            isLight={isLight}
            motion={motion}
          />
        ))}
        <OrbitalMarkers motion={motion} palette={palette} />
      </group>
    </>
  )
}

function QualityController() {
  const setDpr = useThree((state) => state.setDpr)
  const viewportWidth = useThree((state) => state.size.width)
  const sample = useRef({ frames: 0, seconds: 0, dpr: 0 })

  useFrame((_, delta) => {
    sample.current.frames += 1
    sample.current.seconds += Math.min(delta, 0.1)

    if (sample.current.frames < 90) return

    const fps = sample.current.frames / sample.current.seconds
    const deviceDpr = Math.max(1, window.devicePixelRatio || 1)
    const targetDpr = Math.min(
      deviceDpr,
      viewportWidth < 768 ? 1.15 : fps < 48 ? 1 : fps < 56 ? 1.25 : 1.5,
    )

    if (Math.abs(sample.current.dpr - targetDpr) > 0.05) {
      setDpr(targetDpr)
      sample.current.dpr = targetDpr
    }

    sample.current.frames = 0
    sample.current.seconds = 0
  })

  return null
}

function WebGLLifecycle() {
  const gl = useThree((state) => state.gl)

  useEffect(
    () => () => {
      gl.renderLists.dispose()
    },
    [gl],
  )

  return null
}

function VisualTestController() {
  const setFrameloop = useThree((state) => state.setFrameloop)

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('visual-test')) return

    const freeze = () => setFrameloop('never')
    const resume = () => setFrameloop('always')
    window.addEventListener('ozastra:freeze-orbital', freeze)
    window.addEventListener('ozastra:resume-orbital', resume)
    return () => {
      window.removeEventListener('ozastra:freeze-orbital', freeze)
      window.removeEventListener('ozastra:resume-orbital', resume)
    }
  }, [setFrameloop])

  return null
}

function useReducedMotion() {
  const [preference, setPreference] = useState<boolean | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPreference(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return preference
}

function Fallback() {
  return (
    <div
      className="orbital-fallback"
      data-orbital-fallback="true"
      aria-hidden="true"
    >
      <span className="orbital-fallback__core" />
      <span className="orbital-fallback__ring orbital-fallback__ring--one" />
      <span className="orbital-fallback__ring orbital-fallback__ring--two" />
      <span className="orbital-fallback__ring orbital-fallback__ring--three" />
      <span className="orbital-fallback__ring orbital-fallback__ring--four" />
    </div>
  )
}

export default function OrbitalExperience() {
  const reducedMotion = useReducedMotion()
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getDocumentTheme,
    getServerTheme,
  )
  const motion = useRef<MotionState>({
    pointerX: 0,
    pointerY: 0,
    story: 0,
  })

  useEffect(() => {
    if (reducedMotion !== false) return

    gsap.registerPlugin(ScrollTrigger)
    const onPointerMove = (event: PointerEvent) => {
      motion.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      motion.current.pointerY = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    const onPointerLeave = () => {
      motion.current.pointerX = 0
      motion.current.pointerY = 0
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    const stageElements = storyStages
      .map((stage) =>
        document.querySelector<HTMLElement>(`[data-orbital-stage="${stage}"]`),
      )
      .filter((element): element is HTMLElement => Boolean(element))
    let stageOffsets: number[] = []

    const masterTimeline = gsap
      .timeline({ paused: true })
      .to(motion.current, { story: 1, duration: 1, ease: 'none' })

    const measureStages = () => {
      stageOffsets = stageElements.map(
        (element) => element.getBoundingClientRect().top + window.scrollY,
      )
    }

    const syncStory = () => {
      if (stageOffsets.length < 2) return

      const cursor = window.scrollY + window.innerHeight * 0.52
      const position = resolveStoryPosition(stageOffsets, cursor)

      masterTimeline.progress(position.progress)
      document.documentElement.dataset.orbitalStage =
        storyStages[Math.min(position.stageIndex, storyStages.length - 1)]
    }

    const scrollTrigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      invalidateOnRefresh: true,
      onRefresh: () => {
        measureStages()
        syncStory()
      },
      onUpdate: syncStory,
    })
    const refreshFrame = window.requestAnimationFrame(() =>
      ScrollTrigger.refresh(),
    )

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      scrollTrigger.kill()
      masterTimeline.kill()
      delete document.documentElement.dataset.orbitalStage
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener(
        'pointerleave',
        onPointerLeave,
      )
    }
  }, [reducedMotion])

  if (reducedMotion !== false) return <Fallback />

  return (
    <div
      aria-hidden="true"
      className="orbital-canvas-shell"
      data-orbital-canvas="true"
      data-orbital-theme={theme}
    >
      <Canvas
        camera={{ fov: 38, near: 0.1, far: 100, position: [0, 0, 7.4] }}
        dpr={[1, 1.5]}
        fallback={<Fallback />}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <OrbitalScene motion={motion} theme={theme} />
      </Canvas>
    </div>
  )
}

function getServerTheme(): Theme {
  return 'dark'
}
