import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ExhibitionHall from './pages/ExhibitionHall'

export default function App() {
  const queryClient = new QueryClient()
  return (
    <>
      <div className="w-screen h-screen bg-cover bg-center">
        <QueryClientProvider client={queryClient}>
          <ExhibitionHall />
        </QueryClientProvider>
      </div>
    </>
  )
}
