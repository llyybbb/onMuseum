import { Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useDepartments } from '../../hooks/useDepartments'

export default function Header() {
  const [MenuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
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

          <div ref={menuRef} className="relative">
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="flex justify-center items-center p-2 rounded-full glass cursor-pointer"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <Menu color="white" size={25} />
            </motion.div>

            <AnimatePresence>
              {MenuOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -12,
                    scale: 0.96,
                    filter: 'blur(8px)',
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    scale: 0.97,
                    filter: 'blur(6px)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 22,
                    mass: 0.9,
                  }}
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                  className="w-[300px] h-[350px] rounded-3xl absolute top-[48px] right-0 overflow-y-scroll"
                >
                  <ul className="glass rounded-3xl space-y-4 text-white text-[18px] p-[20px] shadow-2xl">
                    <li className="text-white text-[23px] font-[philosopher]">
                      Category
                    </li>

                    {departments.map((item, index) => (
                      <motion.li
                        key={item.departmentId}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{
                          delay: 0.04 * index,
                          duration: 0.2,
                        }}
                        className="py-[5px] px-[20px] glass rounded-xl transition-transform duration-200 hover:scale-[1.03]"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Link
                          to={`/hall/${item.departmentId}`}
                          className="block w-full"
                        >
                          {item.displayName}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  )
}
