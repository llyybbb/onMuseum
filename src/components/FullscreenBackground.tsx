import { useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function FullscreenBackground() {
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
