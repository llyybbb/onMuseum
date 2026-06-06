import '../styles/glass.css'
import '../styles/swiper-custom.css'

import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { EffectCoverflow } from 'swiper/modules'
import 'swiper/css/effect-coverflow'
import ChevronBtn from '../components/common/ChevronBtn'
import { Maximize } from 'lucide-react'
import gsap from 'gsap'
import { Observer } from 'gsap/Observer'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDepartments } from '../hooks/useDepartments'
import ExpandModal from '../modals/ExpandModal'
import { withApiBase } from '../api/baseUrl'

gsap.registerPlugin(Observer)

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

type MarqueeTextProps = {
  text?: string
  className?: string
  align?: 'left' | 'center'
}

function MarqueeText({
  text,
  className = '',
  align = 'center',
}: MarqueeTextProps) {
  const displayText = text?.trim() || 'Unknown'

  return (
    <div className={`hall-marquee-row is-${align}-aligned ${className}`}>
      <div className="hall-marquee-track">
        <span className="hall-marquee-group">
          <span className="hall-marquee-content">
            {displayText}
          </span>
        </span>
        <span className="hall-marquee-copy" aria-hidden="true">
          {displayText}
        </span>
      </div>
    </div>
  )
}

export default function ExhibitionHall() {
  const navigate = useNavigate()
  const location = useLocation()

  const [modalOpen, setModalOpen] = useState(false)
  const modalBackground = useRef<HTMLDivElement>(null)
  const [expandedImage, setExpandedImage] = useState('')
  const [title,setTitle]=useState('')
  const [artist,setArtist]=useState('')
  const[period,setPeriod]=useState('')
  const [dimensions,setDimensions]=useState('')
  const [classification, setClassification]=useState('')
  const [medium,setMedium]=useState('')

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
  const marqueeScope = useRef<HTMLDivElement>(null)
  const swiperRef = useRef<SwiperClass | null>(null)

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

      const res = await fetch(withApiBase(url))
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

  useLayoutEffect(() => {
    if (!data || !marqueeScope.current) return

    const ctx = gsap.context(() => {
      let timelines: gsap.core.Tween[] = []
      let hoveredMarqueeBox: HTMLElement | null = null
      let hoverCleanupFns: Array<() => void> = []
      const timelinesByBox = new Map<HTMLElement, gsap.core.Tween[]>()
      let frameId = 0
      let isDisposed = false

      const setupMarquees = () => {
        if (isDisposed) return

        timelines.forEach((timeline) => timeline.kill())
        hoverCleanupFns.forEach((cleanup) => cleanup())
        timelines = []
        hoverCleanupFns = []
        timelinesByBox.clear()
        hoveredMarqueeBox = null

        const rows = gsap.utils.toArray<HTMLElement>('.hall-marquee-row')

        rows.forEach((row) => {
          const box = row.closest<HTMLElement>('.hall-marquee-box')
          const track = row.querySelector<HTMLElement>('.hall-marquee-track')
          const group = row.querySelector<HTMLElement>('.hall-marquee-group')
          const content = row.querySelector<HTMLElement>(
            '.hall-marquee-content',
          )

          if (!box || !track || !group || !content) return

          row.classList.remove('is-overflowing')
          gsap.killTweensOf(track)
          gsap.set(track, { x: 0, clearProps: 'transform' })

          const rowWidth = row.getBoundingClientRect().width
          const contentWidth = content.scrollWidth

          if (contentWidth <= rowWidth) return

          row.classList.add('is-overflowing')

          const distance = group.offsetWidth
          const startX = 0

          gsap.set(track, { x: startX })

          const tween = gsap.fromTo(
            track,
            { x: startX },
            {
              x: startX - distance,
              duration: Math.max(distance / 40, 8),
              ease: 'none',
              repeat: -1,
              repeatDelay: 0.4,
            },
          )

          timelines.push(tween)
          timelinesByBox.set(box, [...(timelinesByBox.get(box) ?? []), tween])
        })

        timelinesByBox.forEach((_boxTimelines, box) => {
          const onEnter = () => {
            hoveredMarqueeBox = box
          }
          const onLeave = () => {
            if (hoveredMarqueeBox === box) {
              hoveredMarqueeBox = null
            }
          }

          box.addEventListener('mouseenter', onEnter)
          box.addEventListener('mouseleave', onLeave)

          hoverCleanupFns.push(() => {
            box.removeEventListener('mouseenter', onEnter)
            box.removeEventListener('mouseleave', onLeave)
          })
        })
      }

      const queueSetup = () => {
        window.cancelAnimationFrame(frameId)
        frameId = window.requestAnimationFrame(() => {
          frameId = window.requestAnimationFrame(setupMarquees)
        })
      }

      queueSetup()
      document.fonts?.ready.then(queueSetup)

      const resizeObserver = new ResizeObserver(() => {
        queueSetup()
      })

      resizeObserver.observe(marqueeScope.current!)
      gsap
        .utils
        .toArray<HTMLElement>('.hall-marquee-box')
        .forEach((box) => resizeObserver.observe(box))

      const observer = Observer.create({
        onChangeY(self) {
          if (!hoveredMarqueeBox) return

          const hoveredTimelines = timelinesByBox.get(hoveredMarqueeBox)
          if (!hoveredTimelines?.length) return

          let factor = 2.5

          if (self.deltaY < 0) {
            factor *= -1
          }

          gsap
            .timeline({ defaults: { ease: 'none' } })
            .to(hoveredTimelines, {
              timeScale: factor * 2.5,
              duration: 0.2,
              overwrite: true,
            })
            .to(
              hoveredTimelines,
              { timeScale: factor / 2.5, duration: 1 },
              '+=0.3',
            )
        },
      })

      return () => {
        isDisposed = true
        window.cancelAnimationFrame(frameId)
        resizeObserver.disconnect()
        observer.kill()
        timelines.forEach((timeline) => timeline.kill())
        hoverCleanupFns.forEach((cleanup) => cleanup())
      }
    }, marqueeScope)

    return () => ctx.revert()
  }, [activeIndex, data])

  if (error) return <p>error: {(error as Error).message}</p>

  const items = data?.pages.flatMap((p) => p.items) ?? []
  const activeItem = items[activeIndex]
  const skeletonSlides = Array.from({ length: 5 }, (_, index) => index)

  if (!isLoading && !data) return <p>data 없음</p>

  return (
    <SkeletonTheme
      baseColor="rgba(255, 255, 255, 0.12)"
      highlightColor="rgba(255, 255, 255, 0.28)"
      borderRadius={30}
    >
      <div
        style={{ backgroundImage: `url('/exhibitionBg.svg')` }}
        className="h-screen w-screen bg-cover bg-center "
      >
        <div className="h-screen w-screen bg-black/50 backdrop-blur-[3px]">
          <div
            className="h-full w-full flex flex-col items-center justify-center gap-[40px]"
            ref={(node) => {
              modalBackground.current = node
              marqueeScope.current = node
            }}
            onClick={(e) => {
              if (e.target === modalBackground.current) {
                setModalOpen(false)
              }
            }}
          >
            {modalOpen && (
              <ExpandModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                src={expandedImage}
                title={title}
                artist={artist}
                period={period}
                dimensions={dimensions}
                classification={classification}
                medium={medium}
              />
            )}
            <div
              className={`glass w-[984px] h-[80px] flex  ${isSearchMode ? 'justify-center' : 'justify-between'} items-center px-[20px] rounded-[40px]`}
            >
              {!isSearchMode && isLoading && (
                <Skeleton circle width={44} height={44} />
              )}
              {!isSearchMode && !isLoading && (
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
                  <span>
                    {headerTitle || <Skeleton width={220} height={24} />}
                  </span>
                )}
              </div>
              {!isSearchMode && isLoading && (
                <Skeleton circle width={44} height={44} />
              )}
              {!isSearchMode && !isLoading && (
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
                modules={[EffectCoverflow]}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper
                }}
                onSlideChange={(swiper) => {
                  if (isLoading) return

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
                {isLoading &&
                  skeletonSlides.map((index) => (
                    <SwiperSlide key={`skeleton-${index}`}>
                      <div className="slide-inner relative">
                        <Skeleton
                          width="100%"
                          height="100%"
                          borderRadius={30}
                        />
                        <div className="hall-skeleton-description">
                          <Skeleton width="86%" height={30} />
                          <Skeleton width="70%" height={16} />
                          <Skeleton width="62%" height={16} />
                          <Skeleton width="78%" height={16} />
                          <Skeleton width="54%" height={16} />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                {!isLoading &&
                  items.map((item) => (
                    <SwiperSlide key={item.objectID}>
                      <div className="slide-inner relative">
                        <img src={item.primaryImageSmall} loading="lazy" />
                        <div
                          onClick={() => {
                            setModalOpen(true)
                            setExpandedImage(item.primaryImageSmall)
                            setTitle(item.title)
                            setArtist(item.artistDisplayName)
                            setPeriod(item.period)
                            setDimensions(item.dimensions)
                            setClassification(item.classification)
                            setMedium(item.medium)
                          }}
                          className="absolute top-8 left-1/2 -translate-1/2 w-[104px] h-[35px] glass rounded-[25px] text-white flex justify-center items-center gap-2 cursor-pointer"
                        >
                          <Maximize color="white" size={16} />
                          Expand
                        </div>
                        <div className="hall-marquee-box w-[430px] h-[40%] glass absolute bottom-[5px] left-1/2 -translate-x-1/2 rounded-[30px] flex flex-col gap-2 p-[20px] description overflow-hidden">
                          <MarqueeText
                            text={item.title}
                            className="text-white font-semibold text-[30px]"
                            align="left"
                          />
                          <MarqueeText
                            text={item.medium}
                            className="text-white"
                            align="left"
                          />
                          <MarqueeText
                            text={item.period}
                            className="text-white"
                            align="left"
                          />
                          <MarqueeText
                            text={item.dimensions}
                            className="text-white"
                            align="left"
                          />
                          <MarqueeText
                            text={item.classification}
                            className="text-white"
                            align="left"
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
              </Swiper>
            </div>

            <div className="glass w-[434px] h-[98px] p-[20x] flex justify-between items-center gap-[20px]  px-[20px] rounded-[40px]">
              {isLoading ? (
                <Skeleton circle width={35} height={35} />
              ) : (
                <ChevronBtn
                  direction="left"
                  btnSize="35px"
                  chevronSize="20px"
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="btn-prev"
                />
              )}
              <div className="hall-marquee-box flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden">
                {isLoading ? (
                  <>
                    <Skeleton width={170} height={18} />
                    <Skeleton width={130} height={16} />
                    <Skeleton width={190} height={16} />
                  </>
                ) : (
                  <>
                    <MarqueeText
                      text={activeItem?.artistDisplayName || 'Unknown'}
                      className="text-white font-semibold text-[18px] mb-[4px]"
                    />

                    <MarqueeText
                      text={activeItem?.artistRole}
                      className="text-white text-[16px]"
                    />

                    <MarqueeText
                      text={activeItem?.artistDisplayBio}
                      className="text-white text-[16px]"
                    />
                  </>
                )}
              </div>
              {isLoading ? (
                <Skeleton circle width={35} height={35} />
              ) : (
                <ChevronBtn
                  direction="right"
                  btnSize="35px"
                  chevronSize="20px"
                  onClick={() => swiperRef.current?.slideNext()}
                  className="btn-next"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  )
}
