import { Canvas } from "@react-three/fiber"
import { DnaHelix } from "./dna-helix"
import { NetworkField } from "./network-field"

export function DnaBackground() {
  return (
    <div className="absolute inset-0">
      {/* Soft cinematic glow + cool gradient wash over the white scene */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(32,111,235,0.12), transparent 55%), radial-gradient(circle at 70% 80%, rgba(16,196,196,0.1), transparent 50%)",
        }}
      />
      <Canvas
        className="!absolute inset-0"
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          const canvas = gl.domElement
          canvas.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault()
            },
            false,
          )
        }}
      >
        <color attach="background" args={["#eef4fa"]} />
        <fog attach="fog" args={["#eef4fa", 13, 28]} />

        <ambientLight intensity={1.1} />
        <pointLight position={[4, 4, 6]} intensity={40} color="#9fc6ff" />
        <pointLight position={[-6, -4, 2]} intensity={22} color="#7af0e6" />
        <directionalLight position={[2, 4, 8]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-4, -2, 4]} intensity={1} color="#bfe6ff" />

        <NetworkField />
        <DnaHelix />
      </Canvas>
    </div>
  )
}
