import { Maximize, Minimize, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { fetchClaudeExplanation } from '../api/claude'
import ReactMarkdown from 'react-markdown'
import remarkGfm from './../../node_modules/remark-gfm/lib/index'

type Props = {
  isOpen: boolean
  onClose: () => void
  src: string
  title: string
  artist: string
  period: string
  dimensions: string
  classification: string
  medium: string
}

export default function ExpandModal({
  isOpen,
  onClose,
  src,
  title,
  artist,
  period,
  dimensions,
  classification,
  medium,
}: Props) {
  const [isImgFull, setIsImgFull] = useState(false)
  const [guideText, setGuideText] = useState('')
  const [guideError, setGuideError] = useState('')
  const [isGuideLoading, setIsGuideLoading] = useState(false)
  const [isSparklesExpanded, setIsSparklesExpanded] = useState(false)
  const sparklesButtonRef = useRef<HTMLDivElement | null>(null)
  const sparklesLabelRef = useRef<HTMLSpanElement | null>(null)
  const sparklesContentRef = useRef<HTMLDivElement | null>(null)
  const sparklesTimelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setIsSparklesExpanded(false)
      return
    }

    setGuideText('')
    setGuideError('')
    setIsGuideLoading(false)
    setIsSparklesExpanded(false)
  }, [isOpen, src, title, artist])

  useEffect(() => {
    if (
      !isOpen ||
      !sparklesButtonRef.current ||
      !sparklesLabelRef.current ||
      !sparklesContentRef.current
    ) {
      return
    }

    const ctx = gsap.context(() => {
      const expandedWidth = Math.min(window.innerWidth * 0.35, 520)
      const expandedHeight = Math.min(window.innerHeight * 0.4, 420)

      gsap.set(sparklesLabelRef.current, {
        autoAlpha: 0,
        width: 0,
        x: -8,
      })
      gsap.set(sparklesContentRef.current, {
        autoAlpha: 0,
        y: 8,
      })

      sparklesTimelineRef.current = gsap
        .timeline({
          paused: true,
          defaults: {
            duration: 0.34,
            ease: 'power3.out',
            easeReverse: 'power3.in',
          },
        })
        .to(sparklesButtonRef.current, {
          width: expandedWidth,
          height: expandedHeight,
          borderRadius: 24,
          ease: 'back.out(1.4)',
          easeReverse: 'power2.out',
        })
        .to(
          sparklesLabelRef.current,
          {
            autoAlpha: 1,
            width: 'auto',
            x: 0,
            duration: 0.22,
          },
          '<0.08',
        )
        .to(
          sparklesContentRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.2,
          },
          '<0.08',
        )
    }, sparklesButtonRef)

    return () => {
      ctx.revert()
      sparklesTimelineRef.current = null
    }
  }, [isOpen])

  const handleClose = () => {
    setIsImgFull(false)
    setGuideText('')
    setGuideError('')
    setIsGuideLoading(false)
    setIsSparklesExpanded(false)
    onClose()
  }

  const handleSparklesClick = async () => {
    const nextExpanded = !isSparklesExpanded

    if (nextExpanded) {
      sparklesTimelineRef.current?.play()
    } else {
      sparklesTimelineRef.current?.reverse()
    }

    setIsSparklesExpanded(nextExpanded)

    if (!nextExpanded || isGuideLoading || guideText) return

    setGuideError('')
    setIsGuideLoading(true)

    try {
      const result = await fetchClaudeExplanation({
        imageUrl: src,
        title: title || 'Unknown',
        artist: artist || 'Unknown',
      })

      setGuideText(result.text)
    } catch (error) {
      setGuideError(
        error instanceof Error
          ? error.message
          : 'Failed to load docent explanation.',
      )
    } finally {
      setIsGuideLoading(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className={`fixed z-20 bg-black/50 ${
        isImgFull
          ? 'inset-0 w-screen h-screen overflow-auto'
          : 'w-[90%] h-[95%] rounded-4xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden'
      }`}
    >
      <div
        className={`relative size-full glass ${isImgFull ? '' : 'rounded-4xl'}`}
      >
        {!isImgFull && (
          <X
            color="white"
            size={30}
            className="absolute right-5 top-5 cursor-pointer z-20"
            onClick={handleClose}
          />
        )}

        <div
          className={`flex flex-col gap-3.75 absolute bottom-5 left-5 glass max-w-[30%] max-h-[35%] p-5 rounded-4xl text-white z-10 ${
            isImgFull ? 'left-5' : ''
          }`}
        >
          <div className="flex flex-col gap-1.25">
            <p className="font-semibold text-[30px]">{title}</p>
            <p className="font-semibold text-[20px]">{artist}</p>
          </div>
          <div className="flex flex-col gap-1.25">
            <p>
              {classification}, {medium}
            </p>
            <p>{period}</p>
            <p>{dimensions}</p>
          </div>
        </div>

        <div
          className={`size-full ${
            isImgFull
              ? 'overflow-auto flex items-start justify-center p-0'
              : 'flex items-center justify-center p-5'
          }`}
        >
          <div
            className={`relative ${isImgFull ? 'w-full h-auto' : 'h-full max-w-full'}`}
          >
            {!isImgFull && (
              <Maximize
                color="white"
                size={24}
                className="absolute right-2.5 top-2.5 cursor-pointer z-10"
                onClick={() => setIsImgFull(true)}
              />
            )}
            {isImgFull && (
              <Minimize
                color="white"
                size={24}
                className="absolute right-2.5 top-2.5 cursor-pointer z-10"
                onClick={() => setIsImgFull(false)}
              />
            )}
            <img
              src={src}
              className={`block ${
                isImgFull
                  ? 'w-full h-auto max-w-none object-contain'
                  : 'h-full w-auto max-w-full object-contain'
              }`}
            />
          </div>
        </div>

        <div
          ref={sparklesButtonRef}
          className={`absolute bottom-5 right-5 glass ${
            isSparklesExpanded ? 'rounded-4xl' : 'rounded-full'
          } h-12.5 w-12.5 min-w-12.5 flex flex-col items-start z-10 overflow-hidden text-white ${isImgFull ? 'right-10' : ''} `}
        >
          <button
            type="button"
            aria-expanded={isSparklesExpanded}
            className={`h-12.5 min-h-12.5 w-full flex items-center  border-0 bg-transparent text-white cursor-pointer ${
              isSparklesExpanded
                ? 'justify-start px-4 gap-2'
                : 'justify-center px-0'
            }`}
            onClick={handleSparklesClick}
          >
            <Sparkles
              color="white"
              size={30}
              className={`shrink-0 ${isGuideLoading ? 'opacity-60' : ''}`}
            />
            <span
              ref={sparklesLabelRef}
              className="block overflow-hidden whitespace-nowrap text-sm font-semibold leading-none"
            >
              AI Docent
            </span>
          </button>

          <div
            ref={sparklesContentRef}
            className="w-full flex-1 overflow-auto scrollbar-none px-4 pb-4"
          >
            {isSparklesExpanded &&
              (isGuideLoading || guideError || guideText) && (
                <div className="text-white size-full overflow-auto scrollbar-none">
                  {isGuideLoading && (
                    <p className="font-semibold">
                      도슨트가 설명을 준비하고 있어요...
                    </p>
                  )}
                  {!isGuideLoading && guideError && (
                    <p className="text-red-200">{guideError}</p>
                  )}
                  {!isGuideLoading && !guideError && guideText && (
                    <div className="size-full whitespace-pre-wrap scrollbar-none">
                      <div className="prose text-white prose-headings:text-white prose-strong:font-semibold prose-strong:text-white prose-strong:text-xl">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {guideText}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
