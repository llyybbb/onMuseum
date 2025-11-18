import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import FullscreenBackground from './components/FullscreenBackground'
import LiquidGlassCard from './components/LiquidGlassCard'
import LiquidInfoBox from './components/LiquidInfoBox'
// import ExhibitionHall from './pages/ExhibitionHall'

export default function App() {
  const queryClient = new QueryClient()
  return (
    <>
      <div className="w-screen h-screen bg-cover bg-center">
        <QueryClientProvider client={queryClient}>
          <div className="w-screen h-screen bg-cover bg-center">
                <Canvas
                  className="fixed inset-0 w-screen h-screen"
                  camera={{ position: [0, 0, 5], fov: 50 }}
                  gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
                >
                  <FullscreenBackground />
                  <LiquidGlassCard />
                  <LiquidInfoBox />
                </Canvas>
              </div>
        </QueryClientProvider>
      </div>
    </>
  )
}
