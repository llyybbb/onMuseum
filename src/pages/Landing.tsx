import { Link } from 'react-router-dom'
import { useDepartments } from '../hooks/useDepartments'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow } from 'swiper/modules'

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
        .to(shape, {}, '<')
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
    const container = containerRef.current
    container.addEventListener('mousemove', handleMouseMove)
    gsap.ticker.add(imageTrail)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
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
        className="w-screen h-[200vh] bg-cover bg-center overflow-x-hidden"
        style={{ backgroundImage: `url('/lendingBg.png')` }}
      >
        <div className="w-full h-full flex flex-col items-center">
          <div
            ref={containerRef}
            className="w-full h-[100vh] flex justify-center items-center"
          >
            <img className="flair" src="/highlight_1.jpg" alt=""></img>
            <img className="flair" src="/highlight_2.jpg" alt=""></img>
            <img className="flair" src="/highlight_3.jpg" alt=""></img>
            <img className="flair" src="/highlight_4.jpg" alt=""></img>
            <img className="flair" src="/highlight_5.jpg" alt=""></img>
            <img className="flair" src="/highlight_6.jpg" alt=""></img>
            <img className="flair" src="/highlight_7.jpg" alt=""></img>
            <img className="flair" src="/highlight_8.jpg" alt=""></img>

            <h1 className="text-white text-[150px] text-center font-[philosopher] z-20">
              MuseOn<br></br>Art Gallery
            </h1>
          </div>

          <div className="w-full flex flex-col justify-center items-center gap-[50px]">
            <span className="text-white font-extrabold text-[50px] font-[philosopher]">
              Categories
            </span>

            <Swiper
              loop
              effect="coverflow"
              grabCursor
              centeredSlides
              slidesPerView={5}
              spaceBetween={50}
              coverflowEffect={{
                rotate: 15,
                stretch: 0,
                depth: 300,
                modifier: 1,
                slideShadows: false,
                scale: 0.9,
              }}
              navigation={{ nextEl: '.btn-next', prevEl: '.btn-prev' }}
              modules={[EffectCoverflow]}
              className="swiper w-[80%] overflow-hidden"
            >
              {departments.map((dept) => (
                <Link
                  to={`/hall/${dept.departmentId}`}
                  state={{ departmentName: dept.displayName }}
                  key={dept.departmentId}
                >
                  <SwiperSlide className="w-[200px] h-[150px]">
                    <img src="/highlight_1.jpg"></img>
                    <p className="cursor-pointer text-white">
                      {dept.displayName}
                    </p>
                  </SwiperSlide>
                </Link>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  )
}
