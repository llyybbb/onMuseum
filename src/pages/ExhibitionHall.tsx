import '../styles/glass.css'
import '../styles/swiper-custom.css'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { EffectCoverflow, Navigation } from 'swiper/modules'
import 'swiper/css/effect-coverflow'
import ChevronBtn from '../components/common/ChevronBtn'
import { Maximize } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type MetItem = {
  objectID: number
  title: string
  primaryImageSmall: string
  artistDisplayName: string
  artistBeginDate: string
  artistEndDate: string
  artistDisplayBio: string
  artistRole: string
  period: string
  dimensions: string
  classification: string
  medium: string
  department: string
}

type HallResponse = {
  meta: {
    departmentId: number
    page: number
    size: number
    total: number
    start: number
    end: number
  }
  items: MetItem[]
}

export default function ExhibitionHall() {
  const { departmentId } = useParams()
  const location = useLocation()
  const departmentName = location.state?.departmentName
  const page = 1
  const size = 20
  const [activeIndex, setActiveIndex] = useState(0)

  const { data, isLoading, error } = useQuery<HallResponse>({
    queryKey: ['hall', departmentId, page, size],
    enabled: !!departmentId,
    queryFn: async () => {
      const res = await fetch(
        `/api/hall/${departmentId}?page=${page}&size=${size}`,
      )
      if (!res.ok) throw new Error('서버 요청 실패')
      return res.json()
    },
  })
  if (isLoading) return <p>로딩 중...</p>
  if (error) return <p>에러 발생: {(error as Error).message}</p>
  if (!data) return <p>데이터 없음</p>

  const items = data.items
  const activeItem = items[activeIndex]
  const images = 'https://swiperjs.com/demos/images/nature-1.jpg'

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
              <Swiper
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
                onSlideChange={(swiper) => {
                  setActiveIndex(swiper.realIndex)
                }}
                className="swiper absolute left-1/2 -translate-x-1/2"
              >
                {items.map((item) => (
                  <SwiperSlide key={item.objectID}>
                    <div className="slide-inner relative">
                      <img
                        src={
                          item.primaryImageSmall
                            ? item.primaryImageSmall
                            : images
                        }
                        loading="lazy"
                      />
                      <div className="absolute top-8 left-1/2 -translate-1/2 w-[104px] h-[35px] glass rounded-[25px] text-white flex justify-center items-center gap-2 cursor-pointer">
                        <Maximize color="white" size={16} />
                        Expand
                      </div>
                      <div className="w-[430px] h-[40%] glass absolute bottom-[5px] left-1/2 -translate-x-1/2 rounded-[30px] flex flex-col gap-2 p-[20px] description">
                        <p className="text-white font-semibold text-[30px]">
                          {item.title}
                        </p>
                        <p className="text-white">{item.medium}</p>
                        <p className="text-white">{item.period}</p>
                        <p className="text-white">{item.dimensions}</p>
                        <p className="text-white">{item.classification}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="glass w-[434px] h-[98px] p-[20x] flex justify-between items-center gap-[20px]  px-[20px] rounded-[40px]">
              <ChevronBtn
                direction="left"
                btnSize="35px"
                chevronSize="20px"
                className="btn-prev"
              />
              <div className="flex flex-col items-center w-[310px] overflow-hidden">
                <p className="text-white font-semibold text-[18px] mb-[4px]">
                  {activeItem?.artistDisplayName || 'Unknown'}
                </p>
                <p className="text-white text-[16px]">
                  {activeItem?.artistDisplayName ? activeItem.artistRole : ''}
                </p>
                <p className="text-white text-[16px]">
                  {activeItem?.artistDisplayName
                    ? activeItem.artistDisplayBio
                    : ''}
                </p>
              </div>
              <ChevronBtn
                direction="right"
                btnSize="35px"
                chevronSize="20px"
                className="btn-next"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
