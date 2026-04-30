import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useDepartments } from '../hooks/useDepartments'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

type SlideItem = {
  group: THREE.Group
  mainMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  glowMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  material: THREE.MeshBasicMaterial
  glowMaterial: THREE.MeshBasicMaterial
  side: -1 | 1
  baseZ: number
}

export default function Landing() {
  const { data, isLoading, error } = useDepartments()
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null)
  const titleTextRef = useRef<HTMLHeadingElement | null>(null)
  const subtitleTextRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    if (!sectionRef.current || !canvasWrapperRef.current) return

    const section = sectionRef.current
    const canvasWrapper = canvasWrapperRef.current

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#000000')

    const camera = new THREE.PerspectiveCamera(
      50,
      canvasWrapper.clientWidth / canvasWrapper.clientHeight,
      0.1,
      220,
    )
    camera.position.set(0, 0, 8)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    })
    renderer.setSize(canvasWrapper.clientWidth, canvasWrapper.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    canvasWrapper.appendChild(renderer.domElement)

    const loader = new THREE.TextureLoader()

    const imageUrls = [
      '/highlight_1.jpg',
      '/highlight_2.jpg',
      '/highlight_3.jpg',
      '/highlight_4.jpg',
      '/highlight_5.jpg',
      '/highlight_6.jpg',
      '/highlight_7.jpg',
      '/highlight_8.jpg',
    ]

    const slides: SlideItem[] = []
    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []

    const slideGap = 3
    const stackOffsetZ = -60
    const corridorFrontZ = -60
    const planeWidth = 5
    const planeHeight = 7

    imageUrls.forEach((url, index) => {
      const texture = loader.load(url)
      texture.colorSpace = THREE.SRGBColorSpace

      const mainGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
      const glowGeometry = new THREE.PlaneGeometry(
        planeWidth * 1.14,
        planeHeight * 1.14,
      )

      const mainMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
        depthTest: true,
        depthWrite: false,
      })

      const glowMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.18,
        depthTest: true,
        depthWrite: false,
        color: new THREE.Color('#d9d9d9'),
        blending: THREE.AdditiveBlending,
      })

      const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial)
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)

      const group = new THREE.Group()
      const side: -1 | 1 = index % 2 === 0 ? -1 : 1
      const baseZ = stackOffsetZ - index * slideGap

      glowMesh.position.z = -0.35
      group.add(glowMesh)
      group.add(mainMesh)

      group.position.set(0, 0, baseZ)
      group.scale.setScalar(1)

      scene.add(group)

      slides.push({
        group,
        mainMesh,
        glowMesh,
        material: mainMaterial,
        glowMaterial,
        side,
        baseZ,
      })

      geometries.push(mainGeometry, glowGeometry)
      materials.push(mainMaterial, glowMaterial)
    })

    const starCount = 900
    const starPositions = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      starPositions[i3] = (Math.random() - 0.5) * 80
      starPositions[i3 + 1] = (Math.random() - 0.5) * 60
      starPositions[i3 + 2] = -Math.random() * 140 - 10
    }

    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(starPositions, 3),
    )

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
    })

    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    geometries.push(starGeometry)
    materials.push(starMaterial)

    let currentProgress = 0
    let rafId = 0
    let mouseX = 0
    let mouseY = 0
    let cameraOffsetX = 0
    let cameraOffsetY = 0

    const clamp = THREE.MathUtils.clamp
    const lerp = THREE.MathUtils.lerp

    const smoothstep = (value: number) => {
      const t = clamp(value, 0, 1)
      return t * t * (3 - 2 * t)
    }

    function updateScene(progress: number) {
      const p = clamp(progress, 0, 1)

      const titleT = smoothstep((p - 0.03) / 0.12)
      const subtitleT = smoothstep((p - 0.1) / 0.12)

      if (titleTextRef.current) {
        titleTextRef.current.style.opacity = `${titleT}`
        titleTextRef.current.style.transform = `translateY(${
          40 - 40 * titleT
        }px) scale(${0.92 + 0.08 * titleT})`
      }

      if (subtitleTextRef.current) {
        subtitleTextRef.current.style.opacity = `${subtitleT}`
        subtitleTextRef.current.style.transform = `translateY(${
          24 - 24 * subtitleT
        }px) scale(${0.96 + 0.04 * subtitleT})`
      }

      const imageStart = 0.22
      const imageReveal = smoothstep((p - imageStart) / 0.08)
      const imageP = clamp((p - imageStart) / (1 - imageStart), 0, 1)
      const travel = slides.length * slideGap

      let strongestFocus = 0
      let strongestSide: -1 | 1 = 1

      const targetCameraZ = 8 - imageP * travel * 0.9

      slides.forEach((slide, index) => {
        const local = imageP * slides.length - index

        const behind = Math.max(-local, 0)
        const pass = clamp(local, 0, 1)
        const focus = clamp(1 - Math.abs(local), 0, 1)

        let x = 0
        let y = 0
        let z = slide.baseZ

        let scale = 1
        let opacity = 1
        let glowOpacity = 0.16

        if (local <= 0) {
          const visibleDepth = 4
          const corridorSpread = clamp(behind / visibleDepth, 0, 1)

          const corridorX = slide.side * lerp(0.08, 0.35, corridorSpread)
          const prePassX = slide.side * 1.2

          x = lerp(corridorX, prePassX, focus)
          y = 0
          z = corridorFrontZ - behind * slideGap

          const distanceToCamera = Math.max(targetCameraZ - z, 0)

          const nearDist = 6
          const farDist = 34

          let alphaT =
            1 -
            clamp((distanceToCamera - nearDist) / (farDist - nearDist), 0, 1)

          alphaT = smoothstep(alphaT)

          const blendT = Math.max(alphaT, focus * 0.9)

          scale = lerp(0.58, 1.0, blendT)
          opacity = lerp(0.08, 1.0, blendT)
          glowOpacity = lerp(0.02, 0.16, blendT)
        } else {
          const passStartX = slide.side * 1.2
          const passEndX = slide.side * 7.2
          const passEndY = slide.side === -1 ? 0.45 : -0.45

          x = lerp(passStartX, passEndX, pass)
          y = lerp(0, passEndY, pass)
          z = lerp(corridorFrontZ, 2.2, pass)

          const smoothPass = smoothstep(pass)

          scale = lerp(1, 1.2, smoothPass)
          opacity = 1 - smoothPass
          glowOpacity = (1 - smoothPass) * 0.1
        }

        slide.group.position.set(x, y, z)
        slide.group.scale.setScalar(scale)

        slide.material.opacity = opacity * imageReveal
        slide.glowMaterial.opacity = glowOpacity * imageReveal

        if (focus > strongestFocus) {
          strongestFocus = focus
          strongestSide = slide.side
        }
      })

      camera.position.z = lerp(camera.position.z, targetCameraZ, 0.08)

      cameraOffsetX = lerp(cameraOffsetX, mouseX * 0.22, 0.06)
      cameraOffsetY = lerp(cameraOffsetY, mouseY * 0.12, 0.06)

      camera.position.x = lerp(
        camera.position.x,
        strongestSide * 0.12 + cameraOffsetX,
        0.08,
      )
      camera.position.y = lerp(camera.position.y, cameraOffsetY, 0.08)

      camera.fov = 50 - strongestFocus * 1.8
      camera.updateProjectionMatrix()

      stars.position.z = camera.position.z * 0.15
      starMaterial.opacity = 0.9
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${(imageUrls.length + 1) * 1200}`,
      scrub: 3,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        currentProgress = self.progress
      },
    })

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvasWrapper.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width
      const ny = (e.clientY - rect.top) / rect.height

      mouseX = (nx - 0.5) * 2
      mouseY = -(ny - 0.5) * 2
    }

    const handlePointerLeave = () => {
      mouseX = 0
      mouseY = 0
    }

    canvasWrapper.addEventListener('pointermove', handlePointerMove)
    canvasWrapper.addEventListener('pointerleave', handlePointerLeave)

    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop)
      updateScene(currentProgress)
      renderer.render(scene, camera)
    }

    renderLoop()

    const handleResize = () => {
      const width = canvasWrapper.clientWidth
      const height = canvasWrapper.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      canvasWrapper.removeEventListener('pointermove', handlePointerMove)
      canvasWrapper.removeEventListener('pointerleave', handlePointerLeave)

      cancelAnimationFrame(rafId)
      trigger.kill()

      geometries.forEach((geometry) => geometry.dispose())

      materials.forEach((material) => {
        if (material instanceof THREE.MeshBasicMaterial && material.map) {
          material.map.dispose()
        }
        material.dispose()
      })

      renderer.dispose()

      if (renderer.domElement.parentNode === canvasWrapper) {
        canvasWrapper.removeChild(renderer.domElement)
      }
    }
  }, [])

 
    const departments = data?.departments ?? []

  return (
    <div className="bg-black">
      <section
        ref={sectionRef}
        className="relative h-screen overflow-hidden bg-black"
      >
        <div ref={canvasWrapperRef} className="w-full h-full" />

        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center text-center">
            <h1
              ref={titleTextRef}
              className="text-white font-extrabold tracking-[0.25em] font-[philosopher]"
              style={{
                fontSize: 'clamp(50px, 10vw, 120px)',
                opacity: 0,
                transform: 'translateY(40px) scale(0.92)',
                willChange: 'transform, opacity',
                textShadow: '0 0 28px rgba(0,0,0,0.45)',
              }}
            >
              MuseOn
            </h1>

            <p
              ref={subtitleTextRef}
              className="text-white/75 mt-4 tracking-[0.18em] font-[philosopher]"
              style={{
                fontSize: 'clamp(14px, 2vw, 26px)',
                opacity: 0,
                transform: 'translateY(24px) scale(0.96)',
                willChange: 'transform, opacity',
                textShadow: '0 0 20px rgba(0,0,0,0.55)',
              }}
            >
              Discover Art Beyond Frames
            </p>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-12">
          <p className="text-white/80 text-lg tracking-wide">Scroll slowly</p>
        </div>
      </section>

      <section className="h-screen flex gap-[50px] items-center justify-center text-white bg-zinc-900">
        <h2 className="text-4xl font-semibold font-[philosopher]">Category</h2>
        {isLoading && <p className="text-white/60">로딩 중...</p>}

        {error && (
          <p className="text-red-400">에러 발생: {(error as Error).message}</p>
        )}

        {!isLoading && !error && departments.length === 0 && (
          <p className="text-white/60">데이터 없음</p>
        )}

        {!isLoading && !error && departments.length > 0 && (
          <div className="flex flex-col items-center gap-3">
            {departments.map((dept) => (
              <Link
                to={`/hall/${dept.departmentId}`}
                state={{ departmentName: dept.displayName }}
                key={dept.departmentId}
                className="text-white/80 hover:text-white transition-colors text-xl"
              >
                {dept.displayName}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
