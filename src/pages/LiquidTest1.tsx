import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import ExhibitionHall from './pages/ExhibitionHall'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import {
  MeshTransmissionMaterial,
  Environment,
  Capsule,
  Html,
} from '@react-three/drei'
import * as THREE from 'three'

function FullscreenBackground() {
  const { camera } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const texture = useLoader(THREE.TextureLoader, '/exhibitionBg2.png')

  if (!texture.image) return null

  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter

  // ✅ 배경 평면 z 위치(카메라보다 앞, 카메라는 -Z를 봄)
  const planeZ = -1 // 너무 멀리 둘 이유가 없습니다. -1 ~ -2 권장
  const distance = cam.position.z - planeZ // ✅ 실제 거리(예: 5 - (-1) = 6)

  // 카메라 시야(FOV) 기반, 해당 z에서 보이는 화면 높이/너비
  const vFov = (cam.fov * Math.PI) / 180
  const viewHeight = 2 * Math.tan(vFov / 2) * distance
  const viewWidth = viewHeight * cam.aspect

  // 이미지 비율
  const imageAspect = texture.image.width / texture.image.height
  const screenAspect = cam.aspect

  // ✅ CSS bg-cover와 동일한 로직
  let planeWidth = viewWidth
  let planeHeight = viewHeight
  if (screenAspect > imageAspect) {
    // 화면이 더 납작(넓음) → 세로 기준 확대
    planeWidth = viewWidth
    planeHeight = viewWidth / imageAspect
  } else {
    // 화면이 더 세로로 김 → 가로 기준 확대
    planeHeight = viewHeight
    planeWidth = viewHeight * imageAspect
  }

  return (
    <mesh position={[0, 0, planeZ]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

function GlassSphere() {
  return (
    <>
      <Environment preset="warehouse" environmentIntensity={0.8} />
      <Capsule
        scale={[1, 1, 1]}
        args={[0.2, 3, 64, 64]}
        rotation={[0, 0, -Math.PI / 2]}
        position={[0, 0, 0.1]}
      >
        <MeshTransmissionMaterial
          color="white"
          metalness={0}
          roughness={0.1}
          ior={1.33}
          thickness={1}
          chromaticAberration={0}
          clearcoat={0.4}
          resolution={1024}
          clearcoatRoughness={0.05}
          iridescence={0.9}
          iridescenceIOR={0.1}
          iridescenceThicknessRange={[0, 140]}
          samples={4}
        />
        <Html position={[0, 0, 0.15]} center>
          <div className="w-[500px] h-[50px] bg-[#4e4e4e] rounded-[35px]"></div>
        </Html>
      </Capsule>
    </>
  )
}

export default function LiquidTest1() {
  const queryClient = new QueryClient()
  return (
    <>
      <div className="w-screen h-screen bg-cover bg-center">
        <QueryClientProvider client={queryClient}>
          <Canvas
            className="fixed inset-0 w-screen h-screen"
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
          >
            {/* ✅ 배경을 Plane으로 표시 (cover + center) */}
            <FullscreenBackground />

            {/* ✅ 유리 구슬 */}
            <GlassSphere />
          </Canvas>
          {/* <ExhibitionHall /> */}
        </QueryClientProvider>
      </div>
    </>
  )
}
