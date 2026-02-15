import '../styles/glass.css'
import '../styles/swiper-custom.css'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { EffectCoverflow, Navigation } from 'swiper/modules'
import 'swiper/css/effect-coverflow'
import ChevronBtn from '../components/common/ChevronBtn'
import { ChevronLeft, ChevronRight, Maximize } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

type ObjectsResponse = {
  total: number
  objectIDs: number[]
}

export default function ExhibitionHall() {
  const { departmentId } = useParams()
  const location = useLocation()
  const departmentName = location.state?.departmentName

  const { data, isLoading, error } = useQuery({
    queryKey: ['metObjects', departmentId],
    queryFn: async () => {
      const res = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${departmentId}
`,
      )
      const json: ObjectsResponse = await res.json()
      if (!json.total) throw new Error('검색 결과가 없습니다.')
      console.log(json)
      return json
    },
  })
  if (isLoading) return <p>로딩 중...</p>
  if (error) return <p>에러 발생: {(error as Error).message}</p>
  if (!data) return <p>데이터 없음</p>

  const images = [
    'https://swiperjs.com/demos/images/nature-1.jpg',
    'https://swiperjs.com/demos/images/nature-2.jpg',
    'https://swiperjs.com/demos/images/nature-3.jpg',
    'https://swiperjs.com/demos/images/nature-4.jpg',
    'https://swiperjs.com/demos/images/nature-5.jpg',
    'https://swiperjs.com/demos/images/nature-6.jpg',
    'https://swiperjs.com/demos/images/nature-7.jpg',
    'https://swiperjs.com/demos/images/nature-8.jpg',
    'https://swiperjs.com/demos/images/nature-9.jpg',
  ]

  return (
    <>
      <div
        style={{ backgroundImage: `url('/exhibitionBg.svg')` }}
        className="h-screen w-screen bg-cover bg-center "
      >
        <div className="h-screen w-screen bg-black/50 backdrop-blur-[3px]">
          <div className="h-full w-full flex flex-col items-center justify-center gap-[40px]">
            <div className="glass w-[984px] h-[80px] flex justify-between items-center px-[20px] rounded-[40px]">
              <ChevronBtn direction="left" btnSize="44px" chevronSize="24px" />
              <div className="w-[700px] h-[50px] text-white text-[20px] flex justify-center items-center search-box">
                {departmentName}
              </div>
              <ChevronBtn direction="right" btnSize="44px" chevronSize="24px" />
            </div>

            <div className="relative w-[1450px] h-[50%]">
              <div className="btn-prev absolute top-1/2 -translate-y-1/2 left-25 z-20">
                <div className="size-[50px] rounded-[100%] glass flex justify-center items-center">
                  <ChevronLeft color="white" />
                </div>
              </div>
              <Swiper
                loop
                effect="coverflow"
                grabCursor
                centeredSlides
                slidesPerView="auto"
                spaceBetween={50}
                coverflowEffect={{
                  rotate: -15,
                  stretch: 0,
                  depth: 300,
                  modifier: 1,
                  slideShadows: false,
                  scale: 0.9,
                }}
                navigation={{ nextEl: '.btn-next', prevEl: '.btn-prev' }}
                modules={[EffectCoverflow, Navigation]}
                className="swiper absolute left-1/2 -translate-x-1/2"
              >
                {images.map((src, index) => (
                  <SwiperSlide key={index}>
                    <div className="slide-inner relative">
                      <img src={src} loading="lazy" />
                      <div className="absolute top-8 left-1/2 -translate-1/2 w-[104px] h-[35px] glass rounded-[25px] text-white flex justify-center items-center gap-2 cursor-pointer">
                        <Maximize color="white" size={16} />
                        Expand
                      </div>
                      <div className="w-[430px] h-[40%] glass absolute bottom-[5px] left-1/2 -translate-x-1/2 rounded-[30px] flex flex-col gap-2 p-[20px] description">
                        <p className="text-white font-semibold text-[30px]">
                          Title
                        </p>
                        <p className="text-white">설명설명설명설명설명</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="btn-next absolute top-1/2 -translate-y-1/2 right-25 z-20">
                <div className="size-[50px] rounded-[100%] glass flex justify-center items-center">
                  <ChevronRight color="white" />
                </div>
              </div>
            </div>

            <div className="glass w-[434px] h-[98px] p-[20x] flex justify-center items-center gap-[20px]  px-[20px] rounded-[40px]">
              <div className="glass size-[75px] rounded-[20px] overflow-hidden items-center shadow-2xl">
                <img src="/vanGogh.png" className="object-cover" />
              </div>
              <div className="flex flex-col">
                <p className="text-white font-semibold text-[18px] mb-[4px]">
                  vincent ban gogh
                </p>
                <p className="text-white text-[16px]">1853-1920</p>
                <p className="text-white text-[16px]">his hometown</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
