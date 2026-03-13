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
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useDepartments } from '../hooks/useDepartments'
import ExpandModal from '../modals/ExpandModal'

type MetItem = {
  objectID: number
  title: string
  primaryImage: string
  primaryImageSmall: string
  artistDisplayName: string
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
    cursor: number
    nextCursor: number
    size: number
    total: number
    returned: number
    exhausted: boolean
  }
  items: MetItem[]
}

export default function ExhibitionHall() {
  const navigate = useNavigate()
  const location = useLocation()

  const [modalOpen, setModalOpen] = useState(false)
  const modalBackground = useRef<HTMLDivElement>(null)
  const [expandedImage, setExpandedImage] = useState('')

  const { departmentId } = useParams()
  const [searchParams] = useSearchParams()

  const keyword = searchParams.get('q') ?? ''
  const isSearchMode = location.pathname === '/hall/search'

  const currentId = Number(departmentId)
  const { data: deptData } = useDepartments()
  const departments = deptData?.departments ?? []
  const total = departments.length

  const currentIndex = departments.findIndex(
    (d) => d.departmentId === currentId,
  )
  const prevDept = departments[(currentIndex - 1 + total) % total]
  const nextDept = departments[(currentIndex + 1) % total]
  const departmentName = departments[currentIndex]?.displayName ?? ''

  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const headerTitle = isSearchMode ? keyword || 'Search' : departmentName

  const PREFETCH_AT = 10
  const size = 20
  const [activeIndex, setActiveIndex] = useState(0)

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<HallResponse>({
    queryKey: isSearchMode
      ? ['search', keyword, size]
      : ['hall', departmentId, size],
    enabled: isSearchMode ? !!keyword : !!departmentId,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        q: keyword,
        cursor: String(pageParam),
        size: String(size),
      })

      let url = ''

      if (isSearchMode) {
        params.set('q', keyword)
        url = `/api/hall/search?${params.toString()}`
      } else {
        url = `/api/hall/${departmentId}?${params.toString()}`
      }

      console.log('FETCH URL:', url)

      const res = await fetch(url)
      if (!res.ok) throw new Error('Error')
      return (await res.json()) as HallResponse
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.exhausted) return undefined
      return lastPage.meta.nextCursor
    },
  })

  useEffect(() => {
    if (!data || !hasNextPage || isFetchingNextPage) return
    const last = data.pages[data.pages.length - 1]
    if (last && last.items.length === 0 && !last.meta.exhausted) {
      fetchNextPage()
    }
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (isSearching) {
      inputRef.current?.focus()
    }
  }, [isSearching])

  if (isLoading) return <p>로딩 중..</p>
  if (error) return <p>error: {(error as Error).message}</p>
  if (!data) return <p>data 없음</p>

  const items = data?.pages.flatMap((p) => p.items) ?? []
  const activeItem = items[activeIndex]

  return (
    <>
      <div
        style={{ backgroundImage: `url('/exhibitionBg.svg')` }}
        className="h-screen w-screen bg-cover bg-center "
      >
        <div className="h-screen w-screen bg-black/50 backdrop-blur-[3px]">
          <div
            className="h-full w-full flex flex-col items-center justify-center gap-[40px]"
            ref={modalBackground}
            onClick={(e) => {
              if (e.target === modalBackground.current) {
                setModalOpen(false)
              }
            }}
          >
            {modalOpen && <ExpandModal src={expandedImage} title="vanGogh" />}
            <div className="glass w-[984px] h-[80px] flex justify-between items-center px-[20px] rounded-[40px]">
              {!isSearchMode && (
                <Link to={`/hall/${prevDept?.departmentId}`}>
                  <ChevronBtn
                    direction="left"
                    btnSize="44px"
                    chevronSize="24px"
                  />
                </Link>
              )}
              <div
                className="w-[700px] h-[50px] text-white text-[20px] flex justify-center items-center search-box cursor-text"
                onClick={() => setIsSearching(true)}
              >
                {isSearching ? (
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsSearching(false)
                        } else if (e.key === 'Enter') {
                          navigate(
                            `/hall/search?q=${encodeURIComponent(searchTerm)}`,
                          )
                        }
                      }}
                      onBlur={() => setIsSearching(false)}
                      placeholder="검색어를 입력하세요"
                      className="w-full h-full bg-transparent outline-none text-center placeholder:text-white/60"
                    />
                  </form>
                ) : (
                  <span>{headerTitle}</span>
                )}
              </div>
              {!isSearchMode && (
                <Link to={`/hall/${nextDept?.departmentId}`}>
                  <ChevronBtn
                    direction="right"
                    btnSize="44px"
                    chevronSize="24px"
                  />
                </Link>
              )}
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
                  const idx = swiper.realIndex
                  setActiveIndex(idx)

                  const remaining = items.length - 1 - idx
                  if (
                    remaining <= PREFETCH_AT &&
                    hasNextPage &&
                    !isFetchingNextPage
                  ) {
                    fetchNextPage()
                  }
                }}
                className="swiper absolute left-1/2 -translate-x-1/2"
              >
                {items.map((item) => (
                  <SwiperSlide key={item.objectID}>
                    <div className="slide-inner relative">
                      <img src={item.primaryImageSmall} loading="lazy" />
                      <div
                        onClick={() => {
                          setModalOpen(true)
                          setExpandedImage(item.primaryImageSmall)
                        }}
                        className="absolute top-8 left-1/2 -translate-1/2 w-[104px] h-[35px] glass rounded-[25px] text-white flex justify-center items-center gap-2 cursor-pointer"
                      >
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
              <div className="flex flex-col items-center w-[250px] overflow-hidden">
                <p className="text-white font-semibold text-[18px] mb-[4px]">
                  {activeItem?.artistDisplayName || 'Unknown'}
                </p>
                <p className="text-white text-[16px]">
                  {activeItem?.artistRole}
                </p>
                <p className="text-white text-[16px]">
                  {activeItem?.artistDisplayBio}
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
