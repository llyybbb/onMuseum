import '../styles/glass.css'
import '../styles/swiper-custom.css'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css/effect-coverflow'
import ChevronBtn from '../components/common/ChevronBtn'

export default function ExhibitionHall() {
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
        <div className="h-screen w-screen bg-black/25 backdrop-blur-[3px]">
          <div className="h-full w-full flex flex-col items-center justify-center gap-[40px]">
            <div className="glass w-[984px] h-[80px] flex justify-between items-center px-[20px] rounded-[40px]">
              <ChevronBtn direction="left" btnSize="44px" chevronSize="24px" />
              <div className="w-[700px] h-[50px] search-box"></div>
              <ChevronBtn direction="right" btnSize="44px" chevronSize="24px" />
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
              pagination={true}
              navigation={true}
              modules={[EffectCoverflow, Pagination, Navigation]}
              className="swiper"
            >
              {images.map((src, index) => (
                <SwiperSlide key={index}>
                  <div className="slide-inner">
                    <img src={src} loading="lazy" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="glass w-[434px] h-[98px] p-[20x] flex justify-between items-center px-[20px] rounded-[40px]">
              <ChevronBtn direction="left" btnSize="35px" chevronSize="20px" />
              <div className="flex justify-between gap-[20px] items-center">
                <div className='glass size-[75px] rounded-[20px] overflow-hidden items-center shadow-2xl'>
                  <img src='/vanGogh.png' className='object-cover'/>
                </div>
                <div className="flex flex-col">
                  <p className="text-white font-semibold text-[18px] mb-[4px]">vincent ban gogh</p>
                  <p className="text-white text-[16px]">1853-1920</p>
                  <p className='text-white text-[16px]'>his hometown</p>
                </div>
              </div>
              <ChevronBtn direction="right" btnSize="35px" chevronSize="20px" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
