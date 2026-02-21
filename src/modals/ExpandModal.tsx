type Props ={
  src:string
  title:string
}

export default function ExpandModal ({src,title}:Props) {
  return (
    <> 
      <div className="w-auto h-[80%] bg-white rounded-4xl fixed  right-1/2 translate-x-1/2 z-20 overflow-hidden">
      <img src={src} className="object-contain w-full h-full"/>{title}</div>
    </>
  );
}