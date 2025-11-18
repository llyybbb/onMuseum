import { useEffect, useRef, useState } from 'react'
import '../styles/glass.css'

export default function ExhibitionHall () {
    const [position, setPosition] = useState({ x: 100, y: 100 })
    const [dragging, setDragging] = useState(false)
    const dragStart = useRef({ x: 0, y: 0 })

    const handleMouseDown = (e) => {
      setDragging(true)
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
    }

    const handleMouseMove = (e) => {
      if (!dragging) return
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      })
    }

    const handleMouseUp = () => {
      setDragging(false)
    }

    useEffect(() => {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }, [dragging])
  return (
    <>
      <svg style={{ display: 'none' }}>
        <filter id="liquid-glass">
          <feImage
            href="./red_green_gradient_border.png"
            preserveAspectRatio="none"
          />

          <feDisplacementMap
            in="SourceGraphic"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div
        style={{ backgroundImage: `url('/exhibitionBg.svg')` }}
        className="h-[300%] w-screen bg-cover bg-center "
      >
        <div className="h-screen w-screen bg-black/25 backdrop-blur-[3px]">
          <div className="h-full w-full flex flex-col items-center justify-center">
            <div
              onMouseDown={handleMouseDown}
              className="w-[500px] h-[80px] card cursor-move absolute"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
            ></div>
            
          </div>
        </div>
      </div>
    </>
  )
}