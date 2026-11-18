'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const LOOP_SECONDS = 9
const SCENE_SECONDS = 3

const BLUE = '#5b84ff'
const PEACH = '#f5b783'
const PINK = '#ff8fb1'

type Side = -1 | 1

function loopTime(elapsed: number) {
  return elapsed % LOOP_SECONDS
}

function easeOutBack(x: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

const boyTalking: [number, number][] = [
  [0.5, 1.6],
  [3.3, 4.4],
]
const girlTalking: [number, number][] = [
  [1.8, 2.9],
  [4.6, 5.8],
]

function isWithin(t: number, windows: [number, number][]) {
  return windows.some(([start, end]) => t >= start && t <= end)
}

type PersonProps = {
  side: Side
  shirt: string
  skin: string
  hair: string
  accent: string
  isGirl?: boolean
  talking: [number, number][]
}

function Person({ side, shirt, skin, hair, accent, isGirl, talking }: PersonProps) {
  const root = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const mouth = useRef<THREE.Mesh>(null)
  const eyes = useRef<THREE.Group>(null)
  const screen = useRef<THREE.MeshStandardMaterial>(null)
  const phase = side === -1 ? 0 : 1.3

  useFrame(({ clock }) => {
    const t = loopTime(clock.elapsedTime)
    const speaking = isWithin(t, talking)
    const celebrating = t > 6.2

    if (root.current) {
      const hop = celebrating ? Math.max(0, Math.sin((t - 6.2) * 6 + phase)) * 0.08 : 0
      root.current.position.y = Math.sin(clock.elapsedTime * 1.8 + phase) * 0.03 + hop
    }
    if (head.current) {
      const lookUp = speaking || celebrating ? 0.05 : 0.28
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, lookUp, 0.08)
      head.current.rotation.z = Math.sin(clock.elapsedTime * 1.4 + phase) * 0.06
    }
    if (mouth.current) {
      const open = speaking ? 0.6 + Math.abs(Math.sin(clock.elapsedTime * 16)) * 1.4 : celebrating ? 1.4 : 0.5
      mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, open, 0.35)
    }
    if (eyes.current) {
      const blink = (clock.elapsedTime + phase) % 3.2 < 0.12
      eyes.current.scale.y = blink ? 0.15 : 1
    }
    if (screen.current) {
      screen.current.emissiveIntensity = (t > 3 && t < 6 ? 2.4 : 1.4) + (speaking ? 0.6 : 0)
    }
  })

  return (
    <group position={[side * 1.3, 0, 0]} rotation={[0, -side * 0.35, 0]}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.6, 0.66, 0.08, 48]} />
        <meshStandardMaterial color="#141a2e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.012, 8, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} toneMapped={false} />
      </mesh>

      <group ref={root}>
        <mesh position={[-0.12, 0.3, 0]}>
          <capsuleGeometry args={[0.085, 0.3, 6, 12]} />
          <meshStandardMaterial color="#232a44" roughness={0.7} />
        </mesh>
        <mesh position={[0.12, 0.3, 0]}>
          <capsuleGeometry args={[0.085, 0.3, 6, 12]} />
          <meshStandardMaterial color="#232a44" roughness={0.7} />
        </mesh>

        <mesh position={[0, 0.82, 0]}>
          <capsuleGeometry args={[isGirl ? 0.27 : 0.3, 0.42, 8, 20]} />
          <meshStandardMaterial color={shirt} roughness={0.55} />
        </mesh>

        <mesh position={[-0.2, 0.86, 0.18]} rotation={[-1.05, 0, 0.35]}>
          <capsuleGeometry args={[0.075, 0.32, 6, 12]} />
          <meshStandardMaterial color={shirt} roughness={0.55} />
        </mesh>
        <mesh position={[0.2, 0.86, 0.18]} rotation={[-1.05, 0, -0.35]}>
          <capsuleGeometry args={[0.075, 0.32, 6, 12]} />
          <meshStandardMaterial color={shirt} roughness={0.55} />
        </mesh>

        <group position={[0, 0.98, 0.4]} rotation={[-0.55, 0, 0]}>
          <RoundedBox args={[0.22, 0.4, 0.035]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#0d1120" metalness={0.4} roughness={0.3} />
          </RoundedBox>
          <mesh position={[0, 0, 0.019]}>
            <planeGeometry args={[0.18, 0.35]} />
            <meshStandardMaterial ref={screen} color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <mesh position={[-0.13, -0.17, 0.02]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
          <mesh position={[0.13, -0.17, 0.02]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
        </group>

        <mesh position={[0, 1.24, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.12, 16]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>

        <group ref={head} position={[0, 1.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.31, 40, 40]} />
            <meshStandardMaterial color={skin} roughness={0.55} />
          </mesh>

          <mesh rotation={[-0.25, 0, 0]}>
            <sphereGeometry args={[0.325, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            <meshStandardMaterial color={hair} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>

          {isGirl ? (
            <>
              <mesh position={[0, -0.18, -0.12]}>
                <capsuleGeometry args={[0.27, 0.32, 8, 20]} />
                <meshStandardMaterial color={hair} roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.3, -0.12]}>
                <sphereGeometry args={[0.13, 24, 24]} />
                <meshStandardMaterial color={hair} roughness={0.8} />
              </mesh>
              <mesh position={[-0.16, -0.05, 0.25]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color={PINK} transparent opacity={0.55} />
              </mesh>
              <mesh position={[0.16, -0.05, 0.25]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color={PINK} transparent opacity={0.55} />
              </mesh>
            </>
          ) : (
            <mesh position={[0.08, 0.2, 0.2]} rotation={[0.6, 0, -0.3]}>
              <capsuleGeometry args={[0.07, 0.14, 6, 12]} />
              <meshStandardMaterial color={hair} roughness={0.8} />
            </mesh>
          )}

          <group ref={eyes} position={[0, 0.02, 0.28]}>
            <mesh position={[-0.1, 0, 0]}>
              <sphereGeometry args={[0.038, 16, 16]} />
              <meshStandardMaterial color="#111" roughness={0.2} />
            </mesh>
            <mesh position={[0.1, 0, 0]}>
              <sphereGeometry args={[0.038, 16, 16]} />
              <meshStandardMaterial color="#111" roughness={0.2} />
            </mesh>
          </group>

          <mesh ref={mouth} position={[0, -0.12, 0.29]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#7a2e3a" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function ChatBubble({ side, at, color }: { side: Side; at: number; color: string }) {
  const group = useRef<THREE.Group>(null)
  const dots = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    const life = loopTime(clock.elapsedTime) - at
    const duration = 2.2
    if (life < 0 || life > duration) {
      group.current.visible = false
      return
    }
    group.current.visible = true
    const enter = Math.min(life / 0.35, 1)
    const exit = life > duration - 0.3 ? (duration - life) / 0.3 : 1
    const scale = Math.max(0.001, easeOutBack(enter) * exit)
    group.current.scale.setScalar(scale)
    group.current.position.y = 2.15 + life * 0.12

    dots.current?.children.forEach((dot, index) => {
      dot.position.y = Math.max(0, Math.sin(clock.elapsedTime * 8 - index * 0.8)) * 0.04
    })
  })

  return (
    <group ref={group} position={[side * 0.85, 2.15, 0.25]} visible={false}>
      <RoundedBox args={[0.7, 0.38, 0.08]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} />
      </RoundedBox>
      <mesh position={[-side * 0.22, -0.2, 0]} rotation={[0, 0, side * 0.6]}>
        <coneGeometry args={[0.07, 0.14, 3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
      <group ref={dots} position={[0, 0, 0.05]}>
        {[-0.14, 0, 0.14].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function useHeartGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, -0.1)
    shape.bezierCurveTo(-0.02, -0.06, -0.14, -0.02, -0.14, 0.06)
    shape.bezierCurveTo(-0.14, 0.13, -0.06, 0.16, 0, 0.1)
    shape.bezierCurveTo(0.06, 0.16, 0.14, 0.13, 0.14, 0.06)
    shape.bezierCurveTo(0.14, -0.02, 0.02, -0.06, 0, -0.1)
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 3 })
    geometry.center()
    return geometry
  }, [])
}

const hearts = [
  { x: -0.9, delay: 0, drift: 0.2, size: 1.1 },
  { x: -0.3, delay: 0.35, drift: -0.15, size: 0.8 },
  { x: 0.2, delay: 0.15, drift: 0.1, size: 1.3 },
  { x: 0.8, delay: 0.5, drift: -0.2, size: 0.9 },
  { x: 0, delay: 0.8, drift: 0.05, size: 1 },
]

function Hearts() {
  const geometry = useHeartGeometry()
  const refs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = loopTime(clock.elapsedTime)
    hearts.forEach((heart, index) => {
      const mesh = refs.current[index]
      if (!mesh) return
      const life = t - 6.2 - heart.delay
      if (life < 0 || life > 2.4) {
        mesh.visible = false
        return
      }
      mesh.visible = true
      const fade = Math.min(life / 0.3, 1) * Math.min((2.4 - life) / 0.4, 1)
      mesh.scale.setScalar(heart.size * fade)
      mesh.position.set(heart.x + Math.sin(life * 3) * heart.drift, 1.4 + life * 0.75, 0.6)
      mesh.rotation.y = Math.sin(life * 2.5) * 0.5
    })
  })

  return (
    <>
      {hearts.map((heart, index) => (
        <mesh
          key={heart.x}
          ref={(node) => {
            refs.current[index] = node
          }}
          geometry={geometry}
          visible={false}
        >
          <meshStandardMaterial color={PINK} emissive={PINK} emissiveIntensity={0.8} roughness={0.35} />
        </mesh>
      ))}
    </>
  )
}

function SignalLink() {
  const pulse = useRef<THREE.Mesh>(null)
  const tubeMaterial = useRef<THREE.MeshStandardMaterial>(null)
  const curve = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.15, 1.0, 0.4),
        new THREE.Vector3(0, 2.0, 0.7),
        new THREE.Vector3(1.15, 1.0, 0.4),
      ),
    [],
  )
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.008, 8, false), [curve])

  useFrame(({ clock }) => {
    const t = loopTime(clock.elapsedTime)
    const forward = isWithin(t, boyTalking) || (t > 6 && Math.floor(t * 1.2) % 2 === 0)
    const progress = (t * 0.9) % 1
    const point = curve.getPoint(forward ? progress : 1 - progress)
    pulse.current?.position.copy(point)
    if (tubeMaterial.current) {
      tubeMaterial.current.opacity = t > 3 && t < 6 ? 0.85 : 0.45
    }
  })

  return (
    <group>
      <mesh geometry={tube}>
        <meshStandardMaterial
          ref={tubeMaterial}
          color={BLUE}
          emissive={BLUE}
          emissiveIntensity={2}
          transparent
          opacity={0.45}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#cfe0ff" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  )
}

function CameraRig({ onSceneChange }: { onSceneChange: (index: number) => void }) {
  const lastScene = useRef(-1)
  const target = useMemo(() => new THREE.Vector3(0, 1.15, 0), [])

  useFrame(({ camera, clock }) => {
    const t = loopTime(clock.elapsedTime)
    const scene = Math.min(Math.floor(t / SCENE_SECONDS), 2)
    if (scene !== lastScene.current) {
      lastScene.current = scene
      onSceneChange(scene)
    }

    const pushIn = t > 6 ? Math.min((t - 6) / 3, 1) : 0
    const desiredX = Math.sin(clock.elapsedTime * 0.35) * 0.45
    const desiredZ = 5.4 - pushIn * 0.9
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, desiredX, 0.05)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, desiredZ, 0.05)
    camera.lookAt(target)
  })

  return null
}

export default function AdScene({
  active,
  onSceneChange,
}: {
  active: boolean
  onSceneChange: (index: number) => void
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.5, 5.4], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 4, 3]} intensity={1.6} />
      <pointLight position={[-2.5, 1.5, 1.5]} intensity={6} color={BLUE} distance={6} />
      <pointLight position={[2.5, 1.5, 1.5]} intensity={6} color={PEACH} distance={6} />

      <Stars radius={30} depth={20} count={700} factor={2.5} saturation={0} fade speed={0.6} />
      <Sparkles count={36} scale={[5, 3, 2]} position={[0, 1.6, 0]} size={2} speed={0.3} color="#cfe0ff" />

      <Person side={-1} shirt="#3d5fe0" skin="#f0c6a2" hair="#1d1814" accent={BLUE} talking={boyTalking} />
      <Person side={1} shirt="#f2a37a" skin="#f3cdb0" hair="#3a2219" accent={PEACH} isGirl talking={girlTalking} />

      <ChatBubble side={-1} at={0.5} color={BLUE} />
      <ChatBubble side={1} at={1.8} color="#e8935f" />
      <ChatBubble side={-1} at={3.3} color={BLUE} />
      <ChatBubble side={1} at={4.6} color="#e8935f" />

      <SignalLink />
      <Hearts />
      <CameraRig onSceneChange={onSceneChange} />
    </Canvas>
  )
}
