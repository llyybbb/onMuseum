import { Link } from 'react-router-dom'
import { useDepartments } from '../hooks/useDepartments'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

type MousePos = {
  x: number
  y: number
}

export default function Landing() {
  const { data, isLoading, error } = useDepartments()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mousePosRef = useRef<MousePos>({ x: 0, y: 0 })
  const lastMousePosRef = useRef<MousePos>({ x: 0, y: 0 })
  const cachedMousePosRef = useRef<MousePos>({ x: 0, y: 0 })
  const indexRef = useRef(0)

  useEffect(() => {
    if (!data || !containerRef.current) return
    const flair = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll('.flair'),
    )
    if (!flair.length) return

    const gap = 60
    const wrapper = gsap.utils.wrap(0, flair.length)

    function playAnimation(shape: HTMLElement) {
      const tl = gsap.timeline()

      tl.from(shape, {
        opacity: 0,
        scale: 0,
        ease: 'elastic.out(1,0.3)',
      })
        .to(
          shape,
          {
           
          },
          '<',
        )
        .to(
          shape,
          {
            y: '120vh',
            ease: 'back.in(.4)',
            duration: 1,
          },
          0,
        )
    }

    function animateImage() {
      const wrappedIndex = wrapper(indexRef.current)
      const img = flair[wrappedIndex]

      gsap.killTweensOf(img)

      gsap.set(img, {
        clearProps: 'all',
      })

      gsap.set(img, {
        opacity: 1,
        left: mousePosRef.current.x,
        top: mousePosRef.current.y,
        xPercent: -50,
        yPercent: -50,
      })

      playAnimation(img)
      indexRef.current += 1
    }

    function imageTrail() {
      const mousePos = mousePosRef.current
      const lastMousePos = lastMousePosRef.current
      const cachedMousePos = cachedMousePosRef.current

      const travelDistance = Math.hypot(
        lastMousePos.x - mousePos.x,
        lastMousePos.y - mousePos.y,
      )

      cachedMousePos.x = gsap.utils.interpolate(
        cachedMousePos.x || mousePos.x,
        mousePos.x,
        0.1,
      )

      cachedMousePos.y = gsap.utils.interpolate(
        cachedMousePos.y || mousePos.y,
        mousePos.y,
        0.1,
      )

      if (travelDistance > gap) {
        animateImage()
        lastMousePosRef.current = { ...mousePos }
      }
    }

    function handleMouseMove(e: MouseEvent) {
      mousePosRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    gsap.ticker.add(imageTrail)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      gsap.ticker.remove(imageTrail)
      gsap.killTweensOf(flair)
    }
  }, [data])

  if (isLoading) return <p>로딩 중...</p>
  if (error) return <p>에러 발생: {(error as Error).message}</p>
  if (!data) return <p>데이터 없음</p>
  const departments = data?.departments ?? []
  return (
    <>
      <div
        className="w-screen h-screen bg-cover bg-center"
        style={{ backgroundImage: `url('/lendingBg.png')` }}
      >
        <div
          ref={containerRef}
          className="w-full h-full flex flex-col justify-center items-center"
        >
          <img className="flair" src="/highlight_1.jpg" alt=""></img>
          <img className="flair" src="/highlight_2.jpg" alt=""></img>
          <img className="flair" src="/highlight_3.jpg" alt=""></img>
          <img className="flair" src="/highlight_4.jpg" alt=""></img>
          <img className="flair" src="/highlight_5.jpg" alt=""></img>
          <img className="flair" src="/highlight_6.jpg" alt=""></img>
          <img className="flair" src="/highlight_7.jpg" alt=""></img>
          <img className="flair" src="/highlight_8.jpg" alt=""></img>
          <img src="/logo_1.png" className="h-[500px] z-20"></img>
            <h1 className="text-white text-[150px] text-center font-[philosopher] z-20">
              MuseOn<br></br>Art Gallery
            </h1>

          <span>Categories</span>
          <div className="flex gap-5">
            {departments.map((dept) => (
              <Link
                to={`/hall/${dept.departmentId}`}
                state={{ departmentName: dept.displayName }}
              >
                <p key={dept.departmentId} className="cursor-pointer">
                  {dept.displayName}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
