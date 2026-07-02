"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import * as THREE from "three"

const TEAL = "#3a9fd1"

function createSeededValue(seed: number, index: number) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453
  return value - Math.floor(value)
}

export function NetworkField({ nodeCount = 90 }: { nodeCount?: number }) {
  const groupRef = useRef<Group>(null)

  const { positions, linePositions } = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < nodeCount; i++) {
      pts.push(
        new THREE.Vector3(
          (createSeededValue(11, i) - 0.5) * 26,
          (createSeededValue(17, i) - 0.5) * 16,
          (createSeededValue(23, i) - 0.5) * 10 - 4,
        ),
      )
    }

    const positions = new Float32Array(pts.length * 3)
    pts.forEach((p, i) => {
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
    })

    // Connect nearby points with faint lines
    const lines: number[] = []
    const threshold = 4
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < threshold) {
          lines.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z)
        }
      }
    }

    return { positions, linePositions: new Float32Array(lines) }
  }, [nodeCount])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={TEAL}
          size={0.1}
          sizeAttenuation
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={TEAL} transparent opacity={0.12} depthWrite={false} />
      </lineSegments>
    </group>
  )
}
