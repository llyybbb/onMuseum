import { Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDepartments } from '../../hooks/useDepartments'

export default function Header() {
  const [MenuOpen, SetMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        SetMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const { data: deptData } = useDepartments()
  const departments = deptData?.departments ?? []

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[75px] z-50">
        <div className="min-w-full h-full flex items-center justify-between px-[156px]">
          <Link to={'/'}>
            <div className="flex justify-between items-center gap-[10px]">
              <img src="/logo_2.png" className="h-[30px]" />
              <span className="text-white text-[35px] font-[philosopher]">
                MuseOn
              </span>
            </div>
          </Link>

          <Menu
            color="white"
            size={25}
            className="cursor-pointer"
            onClick={() => SetMenuOpen(!MenuOpen)}
          />
        </div>
        {MenuOpen && (
          <div
            ref={menuRef}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="w-[300px] h-[350px] rounded-3xl absolute top-[55px] right-[150px] overflow-y-scroll"
          >
            <ul className="glass rounded-3xl divide-y divide-white/20 space-y-4 text-white text-[18px] p-[20px]">
              {departments.map((item) => {
                return (
                  <li
                    className="py-[5px] px-[20px] glass rounded-xl"
                    onClick={() => SetMenuOpen(!MenuOpen)}
                  >
                    <Link to={`/hall/${item.departmentId}`}>
                      {item.displayName}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </header>
    </>
  )
}
