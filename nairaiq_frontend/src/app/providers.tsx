import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })

const Providers: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} fallbackElement={<div className="p-8">Loading...</div>} />
    </QueryClientProvider>
  )
}

export default Providers
