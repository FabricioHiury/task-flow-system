import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/auth-context'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/toaster'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <Outlet />
          </main>
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
        <TanStackRouterDevtools />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})