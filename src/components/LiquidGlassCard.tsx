import {
  Environment,
  Html,
  MeshTransmissionMaterial,
  RoundedBox,
} from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'
import {Search} from 'lucide-react'


export default function LiquidGlassCard() {
  const ref = useRef<THREE.Mesh>(null)

  return (
    <>
      <Environment preset="warehouse" environmentIntensity={0.7} />
      <RoundedBox
        ref={ref}
        args={[5, 0.4, 0.35]}
        radius={0.2}
        smoothness={8}
        position={[0, 1.6, 0]}
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
          <div
            style={{ boxShadow: 'inset 0 4px 4px rgba(0, 0, 0, 0.5)' }}
            className="flex bg-[#4e4e4e] w-[700px] h-[50px] rounded-[35px] px-[30px] items-center justify-between "
          >
            <p className='cursor-text w-[100%] flex items-center justify-center text-white text-[18px] font-medium'>ddd</p>
            <Search color="white" className="cursor-pointer" />
          </div>
        </Html>
      </RoundedBox>
    </>
  )
}


