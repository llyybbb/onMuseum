import { Maximize, Minimize, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchClaudeExplanation } from '../api/claude'

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
            className="absolute right-[20px] top-[20px] cursor-pointer z-20"
            onClick={handleClose}
          />
        )}

        <div
          className={`flex flex-col gap-[15px] absolute bottom-[20px] left-[20px] glass max-w-[30%] max-h-[35%] p-[20px] rounded-4xl text-white z-10 ${
            isImgFull ? 'hidden' : ''
          }`}
        >
          <div className="flex flex-col gap-[5px]">
            <p className="font-semibold text-[30px]">{title}</p>
            <p className="font-semibold text-[20px]">{artist}</p>
          </div>
          <div className="flex flex-col gap-[5px]">
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
              : 'flex items-center justify-center p-[20px]'
          }`}
        >
          <div
            className={`relative ${isImgFull ? 'w-full h-auto' : 'h-full max-w-full'}`}
          >
            {!isImgFull && (
              <Maximize
                color="white"
                size={24}
                className="absolute right-[10px] top-[10px] cursor-pointer z-10"
                onClick={() => setIsImgFull(true)}
              />
            )}
            {isImgFull && (
              <Minimize
                color="white"
                size={24}
                className="absolute right-[10px] top-[10px] cursor-pointer z-10"
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
          className={`absolute bottom-[20px] right-[20px] glass rounded-full size-[50px] flex justify-center items-center z-10 ${
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
          <div className="absolute bottom-[20px] right-[85px] z-10 glass text-white p-[18px] rounded-3xl w-[35%] max-h-[40%] overflow-auto">
            {isGuideLoading && <p>Preparing docent explanation...</p>}
            {!isGuideLoading && guideError && (
              <p className="text-red-200">{guideError}</p>
            )}
            {!isGuideLoading && !guideError && guideText && (
              <p className="leading-relaxed whitespace-pre-wrap">{guideText}</p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
