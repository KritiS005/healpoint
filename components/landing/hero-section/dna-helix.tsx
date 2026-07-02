"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import * as THREE from "three"

const BLUE = "#1f6feb"
const TEAL = "#10c4c4"
const BLUE_GLOW = "#7db4ff"
const TEAL_GLOW = "#7af0e6"

type HelixData = {
  strandA: THREE.Vector3[]
  strandB: THREE.Vector3[]
  curveA: THREE.CatmullRomCurve3
  curveB: THREE.CatmullRomCurve3
}

function useHelixData(count: number, radius: number, height: number, turns: number): HelixData {
  return useMemo(() => {
    const strandA: THREE.Vector3[] = []
    const strandB: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      const angle = t * Math.PI * 2 * turns
      const y = (t - 0.5) * height
      strandA.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
      strandB.push(
        new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius),
      )
    }
    const curveA = new THREE.CatmullRomCurve3(strandA)
    const curveB = new THREE.CatmullRomCurve3(strandB)
    return { strandA, strandB, curveA, curveB }
  }, [count, radius, height, turns])
}

function StrandMaterial({
  color,
  glow,
  intensity = 0.6,
}: {
  color: string
  glow: string
  intensity?: number
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={glow}
      emissiveIntensity={intensity}
      roughness={0.15}
      metalness={0.6}
    />
  )
}

export function DnaHelix() {
  const groupRef = useRef<Group>(null)
  const nodesRef = useRef<(THREE.Mesh | null)[]>([])
  const count = 48
  const radius = 1.7
  const height = 13
  const turns = 3.4

  const { strandA, strandB, curveA, curveB } = useHelixData(count, radius, height, turns)
  const allNodes = useMemo(
    () => [
      ...strandA.map((p) => ({ p, strand: "A" as const })),
      ...strandB.map((p) => ({ p, strand: "B" as const })),
    ],
    [strandA, strandB],
  )

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.3
    }
    for (let i = 0; i < nodesRef.current.length; i++) {
      const mesh = nodesRef.current[i]
      if (!mesh) continue
      const wave = Math.sin(t * 3 - (allNodes[i].p.y / height) * Math.PI * 6)
      const scale = 1 + Math.max(0, wave) * 0.6
      mesh.scale.setScalar(scale)
    }
  })

  return (
    <group ref={groupRef} rotation={[0.12, 0, 0.06]}>
      {/* Flowing backbone ribbons */}
      <mesh>
        <tubeGeometry args={[curveA, 240, 0.13, 12, false]} />
        <StrandMaterial color={BLUE} glow={BLUE_GLOW} intensity={0.5} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curveB, 240, 0.13, 12, false]} />
        <StrandMaterial color={TEAL} glow={TEAL_GLOW} intensity={0.5} />
      </mesh>

      {/* Backbone nodes */}
      {allNodes.map(({ p, strand }, i) => (
        <mesh
          key={`node-${i}`}
          position={p}
          ref={(el) => {
            nodesRef.current[i] = el
          }}
        >
          <sphereGeometry args={[0.2, 20, 20]} />
          {strand === "A" ? (
            <StrandMaterial color={BLUE} glow={BLUE_GLOW} intensity={0.7} />
          ) : (
            <StrandMaterial color={TEAL} glow={TEAL_GLOW} intensity={0.7} />
          )}
        </mesh>
      ))}

      {/* Base-pair rungs */}
      {strandA.map((p, i) => {
        const q = strandB[i]
        const mid = p.clone().add(q).multiplyScalar(0.5)
        const dir = q.clone().sub(p)
        const len = dir.length()
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize(),
        )
        const useTeal = i % 2 === 0
        return (
          <mesh key={`rung-${i}`} position={mid} quaternion={quaternion}>
            <cylinderGeometry args={[0.05, 0.05, len, 10]} />
            {useTeal ? (
              <StrandMaterial color={TEAL} glow={TEAL_GLOW} intensity={0.35} />
            ) : (
              <StrandMaterial color={BLUE} glow={BLUE_GLOW} intensity={0.35} />
            )}
          </mesh>
        )
      })}
    </group>
  )
}
