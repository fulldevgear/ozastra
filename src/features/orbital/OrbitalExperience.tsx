import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { OrbitalFallback, OrbitalLoadingPlaceholder } from './OrbitalFallback'
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

type OrbitalPalette = {
  accent: string
  ambient: string
  astral: string
  foreground: string
  mineral: string
  muted: string
  planet: string
  surfaceLine: string
}

const orbitalPalette: OrbitalPalette = {
  accent: '#5b7cff',
  ambient: '#a7b1d6',
  astral: '#9b7bff',
  foreground: '#f3f0e8',
  mineral: '#131a24',
  muted: '#969cac',
  planet: '#080b12',
  surfaceLine: '#5f6884',
}

const planetVertexShader = /* glsl */ `
  varying vec3 vObjectPosition;
  varying vec3 vWorldNormal;

  void main() {
    vObjectPosition = position;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const planetFragmentShader = /* glsl */ `
  uniform vec3 uAccentColor;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform float uNarrativeLight;

  varying vec3 vObjectPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 lightDirection = normalize(vec3(0.48, 0.58, 0.65));
    float lightFacing = dot(normal, lightDirection);
    float terminator = smoothstep(-0.1, 0.2, lightFacing);
    float directLight = smoothstep(-0.18, 0.78, lightFacing);
    float mineralVariation = sin(dot(vObjectPosition, vec3(17.0, 23.0, 13.0)));
    mineralVariation *= sin(vObjectPosition.y * 29.0 + vObjectPosition.x * 7.0);

    float narrativeExposure = mix(0.22, 1.0, uNarrativeLight);
    vec3 shadow = uBaseColor * 0.12;
    vec3 illuminated = uBaseColor * (0.68 + directLight * 0.42) * narrativeExposure;
    vec3 color = mix(shadow, illuminated, terminator);
    color *= 0.97 + mineralVariation * 0.035;
    color += uAccentColor * pow(directLight, 3.0) * 0.012 * uNarrativeLight;
    color += uHighlightColor * pow(max(lightFacing, 0.0), 7.0) * 0.006 * uNarrativeLight;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const ORBIT_RADIUS = 2.12
const ORBIT_ROTATION: [number, number, number] = [1.06, 0.1, -0.16]
const ORBIT_ANGLES = Array.from(
  { length: 5 },
  (_, index) => 1.1 + (index / 5) * Math.PI * 2,
)
const FINAL_PLANET_CENTER: [number, number, number] = [0, -0.38, -0.88]
const orbitEuler = new THREE.Euler(...ORBIT_ROTATION)
const orbitFacingEuler = new THREE.Euler().setFromQuaternion(
  new THREE.Quaternion().setFromEuler(orbitEuler).invert(),
)
const ORBIT_FACING_ROTATION: [number, number, number] = [
  orbitFacingEuler.x,
  orbitFacingEuler.y,
  orbitFacingEuler.z,
]
const orbitLocalPositions = ORBIT_ANGLES.map(
  (angle) =>
    [Math.cos(angle) * ORBIT_RADIUS, Math.sin(angle) * ORBIT_RADIUS, 0] as [
      number,
      number,
      number,
    ],
)
const orbitWorldOffsets = orbitLocalPositions.map(([x, y, z]) =>
  new THREE.Vector3(x, y, z).applyEuler(orbitEuler),
)

function damp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta))
}

function phase(progress: number, start: number, end: number) {
  return THREE.MathUtils.smoothstep(progress, start, end)
}

function responsiveScene(viewportWidth: number) {
  const mobile = viewportWidth < 6

  return {
    heroPlanetScale: mobile ? 1.7 : 2.14,
    heroPlanetY: mobile ? -2.7 : -3.48,
    orbitScale: mobile ? 0.7 : viewportWidth < 9 ? 0.84 : 1,
    planetScale: mobile ? 0.7 : viewportWidth < 9 ? 0.82 : 0.94,
    wideX: mobile ? 0 : viewportWidth * 0.23,
  }
}

function getOrbitSeat(orbitScale: number): [number, number, number] {
  const offset = orbitWorldOffsets[0]
  return [
    FINAL_PLANET_CENTER[0] + offset.x * orbitScale,
    FINAL_PLANET_CENTER[1] + offset.y * orbitScale,
    FINAL_PLANET_CENTER[2] + offset.z * orbitScale,
  ]
}

function StarField({
  motion,
  palette,
}: {
  motion: React.RefObject<MotionState>
  palette: OrbitalPalette
}) {
  const group = useRef<THREE.Group>(null)
  const material = useRef<THREE.PointsMaterial>(null)
  const positions = useMemo(() => {
    const values = new Float32Array(30 * 3)

    for (let index = 0; index < 30; index += 1) {
      const seed = index + 1
      values[index * 3] = Math.sin(seed * 12.9898) * 6.2
      values[index * 3 + 1] = Math.cos(seed * 7.233) * 3.8
      values[index * 3 + 2] = -2.4 - (index % 5) * 0.34
    }

    return values
  }, [])

  useFrame((_, delta) => {
    const exposure = phase(motion.current.story, 0.58, 0.9)

    if (material.current) {
      material.current.opacity = damp(
        material.current.opacity,
        0.08 + exposure * 0.48,
        2.2,
        delta,
      )
    }

    if (group.current) {
      group.current.rotation.y = damp(
        group.current.rotation.y,
        motion.current.pointerX * 0.018,
        1.8,
        delta,
      )
      group.current.rotation.x = damp(
        group.current.rotation.x,
        motion.current.pointerY * 0.012,
        1.8,
        delta,
      )
    }
  })

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={material}
          color={palette.foreground}
          depthWrite={false}
          opacity={0.08}
          size={0.025}
          sizeAttenuation
          transparent
        />
      </points>
    </group>
  )
}

const surfaceSignals = [
  [-0.38, 1.61, 0.48],
  [0.56, 1.42, 0.72],
  [-0.92, 1.28, 0.64],
  [1.02, 1.12, 0.76],
  [0.12, 1.66, -0.32],
  [-0.66, 1.48, -0.54],
] as const

function OzastraPlanet({
  motion,
  palette,
}: {
  motion: React.RefObject<MotionState>
  palette: OrbitalPalette
}) {
  const planet = useRef<THREE.Group>(null)
  const surface = useRef<THREE.Mesh>(null)
  const atmosphere = useRef<THREE.MeshBasicMaterial>(null)
  const planetMaterial = useRef<THREE.ShaderMaterial>(null)
  const viewportWidth = useThree((state) => state.viewport.width)
  const planetUniforms = useMemo(
    () => ({
      uAccentColor: { value: new THREE.Color(palette.accent) },
      uBaseColor: { value: new THREE.Color(palette.mineral) },
      uHighlightColor: { value: new THREE.Color(palette.foreground) },
      uNarrativeLight: { value: 0.16 },
    }),
    [palette],
  )

  useFrame(({ clock }, delta) => {
    if (!planet.current) return

    const progress = motion.current.story
    const reveal = phase(progress, 0.76, 1)
    const responsive = responsiveScene(viewportWidth)
    const targetX = THREE.MathUtils.lerp(
      responsive.wideX,
      FINAL_PLANET_CENTER[0],
      reveal,
    )
    const targetY = THREE.MathUtils.lerp(
      responsive.heroPlanetY,
      FINAL_PLANET_CENTER[1],
      reveal,
    )
    const targetZ = THREE.MathUtils.lerp(0, FINAL_PLANET_CENTER[2], reveal)
    const targetScale = THREE.MathUtils.lerp(
      responsive.heroPlanetScale,
      responsive.planetScale,
      reveal,
    )

    planet.current.position.x = damp(
      planet.current.position.x,
      targetX + motion.current.pointerX * 0.035,
      2.1,
      delta,
    )
    planet.current.position.y = damp(
      planet.current.position.y,
      targetY + motion.current.pointerY * 0.025,
      2.1,
      delta,
    )
    planet.current.position.z = damp(
      planet.current.position.z,
      targetZ,
      2.1,
      delta,
    )
    planet.current.scale.setScalar(
      damp(planet.current.scale.x, targetScale, 2.1, delta),
    )
    planet.current.rotation.z = damp(
      planet.current.rotation.z,
      reveal * -0.16 + motion.current.pointerX * 0.012,
      1.8,
      delta,
    )

    if (surface.current) {
      surface.current.rotation.y =
        clock.getElapsedTime() * 0.007 + reveal * 0.28
      surface.current.rotation.x = damp(
        surface.current.rotation.x,
        motion.current.pointerY * 0.018,
        1.6,
        delta,
      )
    }

    if (atmosphere.current) {
      atmosphere.current.opacity = damp(
        atmosphere.current.opacity,
        0.065 + reveal * 0.025,
        2,
        delta,
      )
    }

    if (planetMaterial.current) {
      planetMaterial.current.uniforms.uNarrativeLight.value = damp(
        planetMaterial.current.uniforms.uNarrativeLight.value as number,
        0.16 + reveal * 0.84,
        2,
        delta,
      )
    }
  })

  const initial = responsiveScene(viewportWidth)

  return (
    <group
      ref={planet}
      position={[initial.wideX, initial.heroPlanetY, 0]}
      scale={initial.heroPlanetScale}
    >
      <group ref={surface}>
        <mesh>
          <icosahedronGeometry args={[1.72, 5]} />
          <shaderMaterial
            fragmentShader={planetFragmentShader}
            ref={planetMaterial}
            uniforms={planetUniforms}
            vertexShader={planetVertexShader}
          />
        </mesh>
        <mesh scale={1.003}>
          <icosahedronGeometry args={[1.72, 2]} />
          <meshStandardMaterial
            color={palette.surfaceLine}
            depthWrite={false}
            flatShading
            metalness={0.04}
            opacity={0.03}
            roughness={0.96}
            transparent
          />
        </mesh>
        {surfaceSignals.map((position, index) => (
          <mesh key={position.join('-')} position={position}>
            <sphereGeometry args={[index === 0 ? 0.018 : 0.009, 10, 10]} />
            <meshBasicMaterial
              color={index === 0 ? palette.accent : palette.foreground}
              opacity={index === 0 ? 0.88 : 0.34}
              transparent
            />
          </mesh>
        ))}
      </group>
      <mesh scale={1.055}>
        <sphereGeometry args={[1.72, 40, 32]} />
        <meshBasicMaterial
          ref={atmosphere}
          blending={THREE.AdditiveBlending}
          color={palette.accent}
          depthWrite={false}
          opacity={0.065}
          side={THREE.BackSide}
          transparent
        />
      </mesh>
    </group>
  )
}

function AscentTrail({
  motion,
  palette,
}: {
  motion: React.RefObject<MotionState>
  palette: OrbitalPalette
}) {
  const line = useRef<THREE.LineSegments>(null)
  const material = useRef<THREE.LineBasicMaterial>(null)
  const viewportWidth = useThree((state) => state.viewport.width)
  const positions = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.2, 0.5),
      new THREE.Vector3(-0.14, 0.72, 0.42),
      new THREE.Vector3(-0.5, 1.38, 0.28),
      new THREE.Vector3(-0.42, 2.06, 0.12),
    ])
    const points = curve.getPoints(72)
    const values: number[] = []

    for (let index = 0; index < points.length - 1; index += 1) {
      values.push(...points[index].toArray(), ...points[index + 1].toArray())
    }

    return new Float32Array(values)
  }, [])

  useFrame((_, delta) => {
    if (!line.current) return

    const progress = motion.current.story
    const draw = phase(progress, 0.035, 0.74)
    const fade = 1 - phase(progress, 0.76, 0.94)
    const segmentCount = Math.floor((positions.length / 3) * draw)
    const { wideX } = responsiveScene(viewportWidth)

    line.current.geometry.setDrawRange(0, segmentCount)
    line.current.position.x = damp(
      line.current.position.x,
      wideX + motion.current.pointerX * 0.025,
      2,
      delta,
    )

    if (material.current) {
      material.current.opacity = damp(
        material.current.opacity,
        0.5 * fade,
        2.4,
        delta,
      )
    }
  })

  return (
    <lineSegments ref={line} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        ref={material}
        blending={THREE.AdditiveBlending}
        color={palette.accent}
        depthWrite={false}
        opacity={0}
        transparent
      />
    </lineSegments>
  )
}

const modulePositions: [number, number, number][] = [
  [0.31, 0.21, 0],
  [-0.31, 0.21, 0],
  [0.31, -0.21, 0],
  [-0.31, -0.21, 0],
]

type ProductKind = 'web' | 'ai' | 'saas' | 'mobile' | 'hybrid'

const PRODUCT_KINDS: ProductKind[] = ['web', 'ai', 'saas', 'mobile']
const PRODUCT_DIMENSIONS: Record<
  ProductKind,
  [width: number, height: number, depth: number]
> = {
  web: [0.98, 0.62, 0.12],
  ai: [0.68, 0.68, 0.15],
  saas: [0.9, 0.68, 0.14],
  mobile: [0.48, 0.8, 0.13],
  hybrid: [0.92, 0.68, 0.16],
}

function InterfaceBar({
  color,
  height,
  position,
  width,
}: {
  color: string
  height: number
  position: [number, number, number]
  width: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, 0.012]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

function InterfaceDot({
  color,
  position,
  radius = 0.014,
}: {
  color: string
  position: [number, number, number]
  radius?: number
}) {
  return (
    <mesh position={position}>
      <circleGeometry args={[radius, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

function ProductInterface({
  kind,
  palette,
  surfaceZ,
}: {
  kind: ProductKind
  palette: OrbitalPalette
  surfaceZ: number
}) {
  if (kind === 'web') {
    return (
      <group>
        <InterfaceBar
          color={palette.surfaceLine}
          height={0.018}
          position={[0, 0.21, surfaceZ]}
          width={0.78}
        />
        {[-0.35, -0.3, -0.25].map((x, index) => (
          <InterfaceDot
            color={index === 0 ? palette.accent : palette.muted}
            key={x}
            position={[x, 0.255, surfaceZ]}
            radius={0.012}
          />
        ))}
        <InterfaceBar
          color={palette.foreground}
          height={0.055}
          position={[-0.2, 0.09, surfaceZ]}
          width={0.34}
        />
        <InterfaceBar
          color={palette.accent}
          height={0.12}
          position={[-0.22, -0.06, surfaceZ]}
          width={0.3}
        />
        {[0.1, 0, -0.1].map((y, index) => (
          <InterfaceBar
            color={index === 1 ? palette.astral : palette.muted}
            height={index === 1 ? 0.05 : 0.026}
            key={y}
            position={[0.22, y, surfaceZ]}
            width={index === 1 ? 0.22 : 0.28}
          />
        ))}
        <InterfaceBar
          color={palette.foreground}
          height={0.018}
          position={[0, -0.22, surfaceZ]}
          width={0.72}
        />
      </group>
    )
  }

  if (kind === 'ai') {
    return (
      <group>
        <mesh position={[0, 0.01, surfaceZ]}>
          <icosahedronGeometry args={[0.105, 2]} />
          <meshBasicMaterial color={palette.accent} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.01, surfaceZ - 0.002]} scale={1.55}>
          <ringGeometry args={[0.095, 0.105, 40]} />
          <meshBasicMaterial
            color={palette.astral}
            opacity={0.54}
            toneMapped={false}
            transparent
          />
        </mesh>
        {[-0.21, 0.21].map((x) => (
          <group key={x}>
            <InterfaceDot
              color={palette.foreground}
              position={[x, 0.13, surfaceZ]}
              radius={0.018}
            />
            <InterfaceDot
              color={palette.astral}
              position={[x, -0.12, surfaceZ]}
              radius={0.018}
            />
            <InterfaceBar
              color={palette.surfaceLine}
              height={0.012}
              position={[x / 2, 0.08, surfaceZ]}
              width={0.15}
            />
            <InterfaceBar
              color={palette.surfaceLine}
              height={0.012}
              position={[x / 2, -0.07, surfaceZ]}
              width={0.15}
            />
          </group>
        ))}
        <InterfaceBar
          color={palette.foreground}
          height={0.025}
          position={[0, 0.245, surfaceZ]}
          width={0.25}
        />
        <InterfaceBar
          color={palette.accent}
          height={0.018}
          position={[0, -0.245, surfaceZ]}
          width={0.34}
        />
      </group>
    )
  }

  if (kind === 'saas') {
    return (
      <group>
        <InterfaceBar
          color={palette.surfaceLine}
          height={0.5}
          position={[-0.32, 0, surfaceZ]}
          width={0.09}
        />
        {[0.18, 0.05, -0.08].map((y, index) => (
          <InterfaceBar
            color={index === 0 ? palette.accent : palette.muted}
            height={0.025}
            key={y}
            position={[-0.32, y, surfaceZ]}
            width={0.045}
          />
        ))}
        {[-0.12, 0.12].map((x, index) => (
          <group key={x}>
            <InterfaceBar
              color={index === 0 ? palette.foreground : palette.astral}
              height={0.1}
              position={[x, 0.17, surfaceZ]}
              width={0.17}
            />
            <InterfaceBar
              color={palette.surfaceLine}
              height={0.018}
              position={[x, 0.17, surfaceZ + 0.003]}
              width={0.085}
            />
          </group>
        ))}
        {[0.07, 0.14, 0.22, 0.11].map((height, index) => (
          <InterfaceBar
            color={index === 2 ? palette.accent : palette.foreground}
            height={height}
            key={`${height}-${index}`}
            position={[-0.2 + index * 0.12, -0.17 + height / 2, surfaceZ]}
            width={0.055}
          />
        ))}
      </group>
    )
  }

  if (kind === 'mobile') {
    return (
      <group>
        <InterfaceBar
          color={palette.foreground}
          height={0.025}
          position={[0, 0.305, surfaceZ]}
          width={0.12}
        />
        <InterfaceBar
          color={palette.accent}
          height={0.13}
          position={[0, 0.15, surfaceZ]}
          width={0.32}
        />
        {[0.015, -0.105, -0.225].map((y, index) => (
          <group key={y}>
            <InterfaceBar
              color={index === 1 ? palette.surfaceLine : palette.foreground}
              height={0.075}
              position={[0, y, surfaceZ]}
              width={0.32}
            />
            <InterfaceDot
              color={index === 1 ? palette.astral : palette.accent}
              position={[-0.11, y, surfaceZ + 0.003]}
              radius={0.014}
            />
          </group>
        ))}
        {[-0.1, 0, 0.1].map((x, index) => (
          <InterfaceDot
            color={index === 1 ? palette.accent : palette.muted}
            key={x}
            position={[x, -0.325, surfaceZ]}
            radius={0.013}
          />
        ))}
      </group>
    )
  }

  return (
    <group>
      <InterfaceBar
        color={palette.surfaceLine}
        height={0.48}
        position={[-0.33, 0, surfaceZ]}
        width={0.1}
      />
      <mesh position={[0.02, 0.015, surfaceZ]}>
        <icosahedronGeometry args={[0.09, 2]} />
        <meshBasicMaterial color={palette.accent} toneMapped={false} />
      </mesh>
      <mesh position={[0.02, 0.015, surfaceZ - 0.002]} scale={1.48}>
        <ringGeometry args={[0.09, 0.105, 40]} />
        <meshBasicMaterial
          color={palette.astral}
          opacity={0.62}
          toneMapped={false}
          transparent
        />
      </mesh>
      {[-0.18, 0, 0.18].map((x, index) => (
        <InterfaceBar
          color={index === 1 ? palette.accent : palette.foreground}
          height={0.07}
          key={x}
          position={[x + 0.04, 0.23, surfaceZ]}
          width={0.13}
        />
      ))}
      {[-0.17, 0, 0.17].map((x, index) => (
        <InterfaceBar
          color={index === 2 ? palette.astral : palette.surfaceLine}
          height={0.075 + index * 0.025}
          key={x}
          position={[x + 0.04, -0.22, surfaceZ]}
          width={0.13}
        />
      ))}
    </group>
  )
}

function ProductMonolith({
  kind,
  palette,
}: {
  kind: ProductKind
  palette: OrbitalPalette
}) {
  const [width, height, depth] = PRODUCT_DIMENSIONS[kind]
  const surfaceZ = depth / 2 + 0.022

  return (
    <group>
      <RoundedBox args={[width, height, depth]} radius={0.065} smoothness={5}>
        <meshPhysicalMaterial
          clearcoat={0.38}
          clearcoatRoughness={0.32}
          color={palette.mineral}
          metalness={0.58}
          roughness={0.32}
        />
      </RoundedBox>
      <RoundedBox
        args={[width - 0.075, height - 0.075, 0.018]}
        position={[0, 0, depth / 2 + 0.01]}
        radius={0.04}
        smoothness={4}
      >
        <meshPhysicalMaterial
          clearcoat={0.7}
          clearcoatRoughness={0.18}
          color={palette.planet}
          emissive={palette.planet}
          emissiveIntensity={0.3}
          metalness={0.25}
          roughness={0.24}
        />
      </RoundedBox>
      <ProductInterface kind={kind} palette={palette} surfaceZ={surfaceZ} />
      <mesh position={[0, -height / 2 - 0.015, 0]}>
        <boxGeometry args={[width * 0.44, 0.018, depth * 0.38]} />
        <meshStandardMaterial
          color={palette.surfaceLine}
          metalness={0.72}
          roughness={0.35}
        />
      </mesh>
    </group>
  )
}

function IdeaArtifact({
  motion,
  palette,
}: {
  motion: React.RefObject<MotionState>
  palette: OrbitalPalette
}) {
  const artifact = useRef<THREE.Group>(null)
  const frame = useRef<THREE.Group>(null)
  const intelligence = useRef<THREE.Group>(null)
  const modules = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const coreMaterial = useRef<THREE.MeshPhysicalMaterial>(null)
  const viewportWidth = useThree((state) => state.viewport.width)

  useFrame(({ clock }, delta) => {
    if (!artifact.current) return

    const progress = motion.current.story
    const lift = phase(progress, 0.04, 0.2)
    const structure = phase(progress, 0.18, 0.36)
    const activation = phase(progress, 0.32, 0.5)
    const system = phase(progress, 0.46, 0.64)
    const finish = phase(progress, 0.6, 0.78)
    const lock = phase(progress, 0.8, 0.98)
    const responsive = responsiveScene(viewportWidth)
    const orbitSeat = getOrbitSeat(responsive.orbitScale)
    const journeyX =
      responsive.wideX - Math.sin(lift * Math.PI * 0.82) * 0.5 - lift * 0.06
    const journeyY = 0.2 + lift * 1.08
    const journeyZ = 0.48 - lift * 0.28
    const targetX = THREE.MathUtils.lerp(journeyX, orbitSeat[0], lock)
    const targetY = THREE.MathUtils.lerp(journeyY, orbitSeat[1], lock)
    const targetZ = THREE.MathUtils.lerp(journeyZ, orbitSeat[2] + 0.16, lock)

    artifact.current.position.x = damp(
      artifact.current.position.x,
      targetX + motion.current.pointerX * (0.05 - lock * 0.025),
      2.7,
      delta,
    )
    artifact.current.position.y = damp(
      artifact.current.position.y,
      targetY + motion.current.pointerY * (0.04 - lock * 0.02),
      2.7,
      delta,
    )
    artifact.current.position.z = damp(
      artifact.current.position.z,
      targetZ,
      2.7,
      delta,
    )
    const assembledScale = 0.5 + finish * 0.38
    const seatedScale = THREE.MathUtils.lerp(assembledScale, 0.5, lock)
    artifact.current.scale.setScalar(
      damp(
        artifact.current.scale.x,
        seatedScale * responsive.orbitScale,
        2.5,
        delta,
      ),
    )
    artifact.current.rotation.x = damp(
      artifact.current.rotation.x,
      THREE.MathUtils.lerp(-lift * 0.08, 0.06, lock) +
        motion.current.pointerY * 0.025,
      2.2,
      delta,
    )
    artifact.current.rotation.y = damp(
      artifact.current.rotation.y,
      clock.getElapsedTime() * 0.085 * (1 - lock) + lock * 0.1,
      2.2,
      delta,
    )
    artifact.current.rotation.z = damp(
      artifact.current.rotation.z,
      THREE.MathUtils.lerp(-lift * 0.18, -0.05, lock),
      2.2,
      delta,
    )

    if (core.current) {
      const breath = 1 + Math.sin(clock.getElapsedTime() * 1.2) * 0.04
      core.current.scale.setScalar(breath + activation * 0.1)
    }

    if (coreMaterial.current) {
      coreMaterial.current.emissiveIntensity = damp(
        coreMaterial.current.emissiveIntensity,
        0.32 + activation * 0.82 + lock * 0.14,
        2.4,
        delta,
      )
    }

    const stages: [React.RefObject<THREE.Group | null>, number, number][] = [
      [frame, structure * (1 - finish * 0.48), 0.18 * structure],
      [intelligence, activation * (1 - finish * 0.34), -0.12 * activation],
      [modules, system * (1 - finish * 0.12), 0.08 * system],
      [shell, finish, 0],
    ]

    stages.forEach(([group, value, rotation]) => {
      if (!group.current) return
      group.current.scale.setScalar(
        damp(group.current.scale.x, Math.max(0.001, value), 3.2, delta),
      )
      group.current.rotation.z = damp(
        group.current.rotation.z,
        rotation,
        2.8,
        delta,
      )
    })
  })

  return (
    <group ref={artifact} position={[0, 0.2, 0.48]} scale={0.5}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.17, 3]} />
        <meshPhysicalMaterial
          ref={coreMaterial}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color={palette.planet}
          emissive={palette.accent}
          emissiveIntensity={0.35}
          metalness={0.62}
          roughness={0.2}
        />
      </mesh>
      <mesh scale={0.22}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color={palette.accent}
          depthWrite={false}
          opacity={0.16}
          transparent
        />
      </mesh>

      <group ref={frame} scale={0.001}>
        {[-0.3, 0.3].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[0.82, 0.035, 0.04]} />
            <meshStandardMaterial
              color={y > 0 ? palette.foreground : palette.muted}
              metalness={0.64}
              roughness={0.38}
            />
          </mesh>
        ))}
        {[-0.39, 0.39].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.035, 0.62, 0.04]} />
            <meshStandardMaterial
              color={x > 0 ? palette.surfaceLine : palette.foreground}
              metalness={0.64}
              roughness={0.38}
            />
          </mesh>
        ))}
      </group>

      <group ref={intelligence} scale={0.001}>
        {[-0.24, 0.24].map((x) => (
          <group key={x}>
            <InterfaceDot
              color={x > 0 ? palette.astral : palette.foreground}
              position={[x, 0.14, 0.06]}
              radius={0.026}
            />
            <InterfaceDot
              color={x > 0 ? palette.foreground : palette.accent}
              position={[x, -0.14, 0.06]}
              radius={0.026}
            />
            <InterfaceBar
              color={palette.surfaceLine}
              height={0.014}
              position={[x / 2, 0.085, 0.055]}
              width={0.2}
            />
            <InterfaceBar
              color={palette.surfaceLine}
              height={0.014}
              position={[x / 2, -0.085, 0.055]}
              width={0.2}
            />
          </group>
        ))}
      </group>

      <group ref={modules} scale={0.001}>
        {modulePositions.map((position, index) => (
          <group key={position.join('-')} position={position}>
            <mesh>
              <boxGeometry args={[0.15, 0.11, 0.035]} />
              <meshStandardMaterial
                color={index === 0 ? palette.accent : palette.mineral}
                emissive={index === 0 ? palette.accent : '#000000'}
                emissiveIntensity={index === 0 ? 0.35 : 0}
                metalness={0.52}
                roughness={0.32}
              />
            </mesh>
            <InterfaceBar
              color={index % 2 === 0 ? palette.foreground : palette.astral}
              height={0.012}
              position={[0, 0, 0.025]}
              width={0.08}
            />
          </group>
        ))}
      </group>

      <group ref={shell} scale={0.001}>
        <ProductMonolith kind="hybrid" palette={palette} />
      </group>
    </group>
  )
}

function TargetStar({
  motion,
  palette,
}: {
  motion: React.RefObject<MotionState>
  palette: OrbitalPalette
}) {
  const star = useRef<THREE.Group>(null)
  const glow = useRef<THREE.MeshBasicMaterial>(null)
  const viewportWidth = useThree((state) => state.viewport.width)

  useFrame(({ clock }, delta) => {
    if (!star.current) return

    const progress = motion.current.story
    const appearance = phase(progress, 0.73, 0.9)
    const contact = phase(progress, 0.9, 0.985)
    const orbitScale = responsiveScene(viewportWidth).orbitScale
    const seat = getOrbitSeat(orbitScale)
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 1.35) * 0.07

    star.current.position.set(seat[0], seat[1], seat[2] + 0.1)
    star.current.scale.setScalar(
      damp(
        star.current.scale.x,
        Math.max(
          0.001,
          appearance * pulse * orbitScale * 0.62 * (1 - contact * 0.7),
        ),
        3,
        delta,
      ),
    )

    if (glow.current) {
      glow.current.opacity = damp(
        glow.current.opacity,
        0.13 * appearance * (1 - contact * 0.72),
        3,
        delta,
      )
    }
  })

  return (
    <group ref={star} scale={0.001}>
      <mesh>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={palette.foreground} />
      </mesh>
      <mesh scale={[1.45, 0.07, 0.07]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color={palette.foreground}
          depthWrite={false}
          opacity={0.42}
          transparent
        />
      </mesh>
      <mesh scale={[0.07, 1.45, 0.07]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color={palette.foreground}
          depthWrite={false}
          opacity={0.42}
          transparent
        />
      </mesh>
      <mesh scale={0.24}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshBasicMaterial
          ref={glow}
          blending={THREE.AdditiveBlending}
          color={palette.accent}
          depthWrite={false}
          opacity={0}
          transparent
        />
      </mesh>
    </group>
  )
}

function ProductNode({
  index,
  kind,
  palette,
  position,
}: {
  index: number
  kind: ProductKind
  palette: OrbitalPalette
  position: [number, number, number]
}) {
  const scale = kind === 'mobile' ? 0.62 : kind === 'ai' ? 0.55 : 0.5

  return (
    <group position={position} rotation={ORBIT_FACING_ROTATION} scale={scale}>
      <group
        rotation={[
          index % 2 === 0 ? 0.025 : -0.02,
          index % 2 === 0 ? -0.07 : 0.07,
          -0.045 + index * 0.018,
        ]}
      >
        <ProductMonolith kind={kind} palette={palette} />
      </group>
    </group>
  )
}

function ProductConstellation({
  motion,
  palette,
}: {
  motion: React.RefObject<MotionState>
  palette: OrbitalPalette
}) {
  const constellation = useRef<THREE.Group>(null)
  const orbitMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const connectionMaterial = useRef<THREE.LineBasicMaterial>(null)
  const viewportWidth = useThree((state) => state.viewport.width)
  const connectionPositions = useMemo(() => {
    const path = [0, 2, 4, 1, 3, 0]
    const values: number[] = []

    for (let index = 0; index < path.length - 1; index += 1) {
      values.push(
        ...orbitLocalPositions[path[index]],
        ...orbitLocalPositions[path[index + 1]],
      )
    }

    return new Float32Array(values)
  }, [])

  useFrame((_, delta) => {
    if (!constellation.current) return

    const progress = motion.current.story
    const reveal = phase(progress, 0.82, 0.965)
    const alignment = phase(progress, 0.925, 1)
    const orbitScale = responsiveScene(viewportWidth).orbitScale

    constellation.current.scale.setScalar(
      damp(
        constellation.current.scale.x,
        Math.max(0.001, reveal * orbitScale),
        2.8,
        delta,
      ),
    )
    constellation.current.rotation.z = damp(
      constellation.current.rotation.z,
      ORBIT_ROTATION[2] + motion.current.pointerX * 0.008,
      1.8,
      delta,
    )

    if (orbitMaterial.current) {
      orbitMaterial.current.opacity = damp(
        orbitMaterial.current.opacity,
        0.13 * reveal,
        2.8,
        delta,
      )
    }

    if (connectionMaterial.current) {
      connectionMaterial.current.opacity = damp(
        connectionMaterial.current.opacity,
        0.1 * alignment,
        3,
        delta,
      )
    }
  })

  return (
    <group
      ref={constellation}
      position={FINAL_PLANET_CENTER}
      rotation={ORBIT_ROTATION}
      scale={0.001}
    >
      <mesh>
        <torusGeometry args={[ORBIT_RADIUS, 0.006, 5, 160]} />
        <meshBasicMaterial
          ref={orbitMaterial}
          color={palette.foreground}
          depthWrite={false}
          opacity={0}
          transparent
        />
      </mesh>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[connectionPositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          ref={connectionMaterial}
          blending={THREE.AdditiveBlending}
          color={palette.accent}
          depthWrite={false}
          opacity={0}
          transparent
        />
      </lineSegments>
      {orbitLocalPositions.slice(1).map((position, index) => (
        <ProductNode
          index={index}
          key={position.join('-')}
          kind={PRODUCT_KINDS[index]}
          palette={palette}
          position={position}
        />
      ))}
    </group>
  )
}

function OrbitalScene({ motion }: { motion: React.RefObject<MotionState> }) {
  return (
    <>
      <QualityController />
      <WebGLLifecycle />
      <VisualTestController />
      <ambientLight color={orbitalPalette.ambient} intensity={0.22} />
      <spotLight
        angle={0.5}
        color={orbitalPalette.foreground}
        intensity={34}
        penumbra={1}
        position={[4.5, 5.5, 6]}
      />
      <pointLight
        color={orbitalPalette.accent}
        intensity={5}
        position={[-4, 0.5, 3]}
      />
      <pointLight
        color={orbitalPalette.astral}
        intensity={2.5}
        position={[3, -4, -2]}
      />

      <StarField motion={motion} palette={orbitalPalette} />
      <OzastraPlanet motion={motion} palette={orbitalPalette} />
      <AscentTrail motion={motion} palette={orbitalPalette} />
      <ProductConstellation motion={motion} palette={orbitalPalette} />
      <TargetStar motion={motion} palette={orbitalPalette} />
      <IdeaArtifact motion={motion} palette={orbitalPalette} />
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

function SceneReady({ onReady }: { onReady: () => void }) {
  const revealFrame = useRef<number | null>(null)
  const signaled = useRef(false)
  const signalReady = useCallback(() => {
    if (signaled.current) return

    signaled.current = true
    onReady()
  }, [onReady])

  useFrame(() => {
    if (signaled.current || revealFrame.current !== null) return

    revealFrame.current = window.requestAnimationFrame(signalReady)
  })

  useEffect(() => {
    const fallbackTimer = window.setTimeout(signalReady, 400)

    return () => {
      window.clearTimeout(fallbackTimer)
      if (revealFrame.current !== null) {
        window.cancelAnimationFrame(revealFrame.current)
      }
    }
  }, [signalReady])

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

export default function OrbitalExperience() {
  const reducedMotion = useReducedMotion()
  const [canvasReady, setCanvasReady] = useState(false)
  const revealCanvas = useCallback(() => setCanvasReady(true), [])
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

  if (reducedMotion === null) return <OrbitalLoadingPlaceholder />
  if (reducedMotion) return <OrbitalFallback />

  return (
    <div
      aria-hidden="true"
      className="orbital-canvas-shell"
      data-orbital-canvas="true"
      data-orbital-ready={canvasReady ? 'true' : 'false'}
    >
      <Canvas
        camera={{ fov: 38, near: 0.1, far: 100, position: [0, 0, 7.4] }}
        dpr={[1, 1.5]}
        fallback={<OrbitalFallback />}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <SceneReady onReady={revealCanvas} />
        <OrbitalScene motion={motion} />
      </Canvas>
    </div>
  )
}
