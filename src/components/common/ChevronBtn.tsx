import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Props {
  direction: 'left' | 'right'
  btnSize: string
  chevronSize: string
}

export default function ChevronBtn({ direction, btnSize, chevronSize }: Props) {
  const Chevron = direction === 'left' ? ChevronLeft : ChevronRight
  return (
    <>
      <div
        className="rounded-[100%] bg-[var(--glass-button-color)] shadow-xl backdrop-blur-md flex justify-center items-center cursor-pointer"
        style={{ width: btnSize, height: btnSize }}
      >
        <Chevron
          className=" text-white"
          style={{ width: chevronSize, height: chevronSize }}
        />
      </div>
    </>
  )
}
