import { ChevronLeft, ChevronRight } from 'lucide-react'
import '../styles/glass.css'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css/effect-coverflow'

export default function ExhibitionHall() {
  return (
    <>
      <div
        style={{ backgroundImage: `url('/exhibitionBg.svg')` }}
        className="h-screen w-screen bg-cover bg-center "
      >
        <div className="h-screen w-screen bg-black/25 backdrop-blur-[3px]">
          <div className="h-full w-full flex flex-col items-center justify-center gap-[40px]">
            <div className="glass w-[984px] h-[80px] flex justify-between items-center px-[20px] ">
              <div className="size-[44px] rounded-[100%] bg-[var(--glass-button-color)] shadow-xl backdrop-blur-md flex justify-center items-center ">
                <ChevronLeft className="size-[24px] text-white" />
              </div>
              <div className="w-[700px] h-[50px] search-box"></div>
              <div className="size-[44px] rounded-[100%] bg-[var(--glass-button-color)] shadow-xl backdrop-blur-md flex justify-center items-center">
                <ChevronRight className="size-[24px] text-white" />
              </div>
            </div>
            <Swiper
              loop={true}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={4}
              coverflowEffect={{
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={true}
              navigation={true}
              modules={[EffectCoverflow, Pagination, Navigation]}
              className="swiper"
            >
              <SwiperSlide className="swiper-slide">
                <img
                  src="https://swiperjs.com/demos/images/nature-1.jpg"
                  loading="lazy"
                />
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <img
                  src="https://swiperjs.com/demos/images/nature-2.jpg"
                  loading="lazy"
                />
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <img
                  src="https://swiperjs.com/demos/images/nature-3.jpg"
                  loading="lazy"
                />
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <img
                  src="https://swiperjs.com/demos/images/nature-4.jpg"
                  loading="lazy"
                />
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <img
                  src="https://swiperjs.com/demos/images/nature-5.jpg"
                  loading="lazy"
                />
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <img
                  src="https://swiperjs.com/demos/images/nature-6.jpg"
                  loading="lazy"
                />
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <img
                  src="https://swiperjs.com/demos/images/nature-7.jpg"
                  loading="lazy"
                />
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <img
                  src="https://swiperjs.com/demos/images/nature-8.jpg"
                  loading="lazy"
                />
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <img
                  src="https://swiperjs.com/demos/images/nature-9.jpg"
                  loading="lazy"
                />
              </SwiperSlide>
            </Swiper>

            <div className="glass w-[434px] h-[94px] p-[20x] flex justify-between items-center"></div>
          </div>
        </div>
      </div>
    </>
  )
}
