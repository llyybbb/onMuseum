import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Props {
  direction: 'left' | 'right'
  btnSize: string
  chevronSize: string
  onClick? : ()=>void
  className?:string
}

export default function ChevronBtn({
  direction,
  btnSize,
  chevronSize,
  onClick,
  className,
}: Props) {
  const Chevron = direction === 'left' ? ChevronLeft : ChevronRight
  return (
    <>
      <div
        className={`rounded-[100%] bg-[var(--glass-button-color)] shadow-xl backdrop-blur-md flex justify-center items-center cursor-pointer ${className}`}
        style={{ width: btnSize, height: btnSize }}
        onClick={onClick}
      >
        <Chevron
          className=" text-white"
          style={{ width: chevronSize, height: chevronSize }}
        />
      </div>
    </>
  )
}
