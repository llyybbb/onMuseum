import {
  Environment,
  Html,
  MeshTransmissionMaterial,
  RoundedBox,
} from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'


export default function LiquidInfoBox() {
  const ref = useRef<THREE.Mesh>(null)

  return (
    <>
      <Environment preset="warehouse" environmentIntensity={0.7} />
      <RoundedBox
        ref={ref}
        args={[1.8, 0.7, 0.35]}
        radius={0.18}
        smoothness={8}
        position={[0, -1.6, 0]}
      >
        <MeshTransmissionMaterial
          color="white"
          transmission={1}
          roughness={0.05}
          thickness={0.8}
          ior={1.45}
          chromaticAberration={0.15}
          distortion={0.2}
          temporalDistortion={0.15}
          iridescence={1}
          iridescenceIOR={1.2}
          iridescenceThicknessRange={[100, 400]}
          clearcoat={0.5}
          clearcoatRoughness={0.05}
          samples={8}
          resolution={1024}
        />
        <Html center>
         <div></div>
        </Html>
      </RoundedBox>
    </>
  )
}
