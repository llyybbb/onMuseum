import { ChevronLeft, ChevronRight } from 'lucide-react'
import '../styles/glass.css'

export default function ExhibitionHall() {
  return (
    <>
      <div
        style={{ backgroundImage: `url('/exhibitionBg.svg')` }}
        className="h-screen w-screen bg-cover bg-center "
      >
        <div className="h-screen w-screen bg-black/25 backdrop-blur-[3px]">
          <div className="h-full w-full flex flex-col items-center justify-center gap-[40px]">
            <div className="glass w-[984px] h-[80px] flex justify-between items-center px-[20px] ">
              <div className="size-[44px] rounded-[100%] bg-[var(--glass-button-color)] shadow-xl backdrop-blur-md flex justify-center items-center ">
                <ChevronLeft className="size-[24px] text-white" />
              </div>
              <div className="w-[700px] h-[50px] search-box"></div>
              <div className="size-[44px] rounded-[100%] bg-[var(--glass-button-color)] shadow-xl backdrop-blur-md flex justify-center items-center">
                <ChevronRight className="size-[24px] text-white" />
              </div>
            </div>
            <div className="h-[536px]"></div>
            <div className="glass w-[434px] h-[94px] p-[20x] flex justify-between items-center"></div>
          </div>
        </div>
      </div>
    </>
  )
}
