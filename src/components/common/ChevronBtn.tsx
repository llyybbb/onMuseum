import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Props {
  direction: 'left' | 'right'
  btnSize: string
  chevronSize: string
  onClick? : ()=>void
}

export default function ChevronBtn({ direction, btnSize, chevronSize, onClick }: Props) {
  const Chevron = direction === 'left' ? ChevronLeft : ChevronRight
  return (
    <>
      <div
        className="rounded-[100%] bg-[var(--glass-button-color)] shadow-xl backdrop-blur-md flex justify-center items-center cursor-pointer"
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
