import { Maximize, Minimize, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchClaudeExplanation } from '../api/claude'
import ReactMarkdown from 'react-markdown'
import remarkGfm from './../../node_modules/remark-gfm/lib/index';


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

  useEffect(() => {
    if (!isOpen) return
    setGuideText('')
    setGuideError('')
    setIsGuideLoading(false)
  }, [isOpen, src, title, artist])

  const handleClose = () => {
    setIsImgFull(false)
    setGuideText('')
    setGuideError('')
    setIsGuideLoading(false)
    onClose()
  }

  const handleSparklesClick = async () => {
    if (isGuideLoading) return

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
            isImgFull ? 'hidden' : ''
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
          className={`absolute bottom-5 right-5 glass rounded-full size-12.5 flex justify-center items-center z-10 ${
            isImgFull ? 'hidden' : ''
          }`}
        >
          <Sparkles
            color="white"
            size={30}
            className={`cursor-pointer ${isGuideLoading ? 'opacity-60' : ''}`}
            onClick={handleSparklesClick}
          />
        </div>

        {!isImgFull && (isGuideLoading || guideError || guideText) && (
          <div className="absolute bottom-5 right-21.25 z-10 rounded-3xl text-white w-[35%] max-h-[40%] overflow-auto scrollbar-none">
            {isGuideLoading && (
              <p className="glass rounded-3xl p-4.5 font-semibold">
                도슨트가 설명을 준비하고 있어요...
              </p>
            )}
            {!isGuideLoading && guideError && (
              <p className="text-red-200 glass rounded-3xl p-4.5">
                {guideError}
              </p>
            )}
            {!isGuideLoading && !guideError && guideText && (
              <div className="size-full glass rounded-3xl p-4.5 whitespace-pre-wrap scrollbar-none">
                <div className='prose text-white prose-headings:text-white prose-strong:font-semibold prose-strong:text-white prose-strong:text-xl'>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{guideText}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
