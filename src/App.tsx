import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRoutes from './routes/routes'
import { BrowserRouter } from 'react-router-dom'

export default function App() {
  const queryClient = new QueryClient()
  return (
    <>
      <BrowserRouter>
        <div className="w-screen h-screen bg-cover bg-center">
          <QueryClientProvider client={queryClient}>
            <AppRoutes />
          </QueryClientProvider>
        </div>
      </BrowserRouter>
    </>
  )
}
