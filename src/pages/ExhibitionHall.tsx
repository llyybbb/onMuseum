import '../styles/glass.css'

export default function ExhibitionHall () {
   
  return (
    <>
      <div
        style={{ backgroundImage: `url('/exhibitionBg.svg')` }}
        className="h-screen w-screen bg-cover bg-center "
      >
        <div className="h-screen w-screen bg-black/25 backdrop-blur-[3px]">
          <div className="h-full w-full flex flex-col items-center justify-center">
            <div
              className="w-[500px] h-[80px] glass"
            ></div>
            
          </div>
        </div>
      </div>
    </>
  )
}