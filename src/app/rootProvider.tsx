"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { ReactNode, useEffect } from 'react'
import { Toaster } from 'sonner'
import Cookies from "js-cookie"
import { constents } from '@/constents'
import { usePathname, useRouter } from 'next/navigation'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function RootProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = Cookies.get(constents.AUTH_KEY)
    const publicRoutes = ['/login', '/'] 
    const isPublicRoute = publicRoutes.includes(pathname)

    if (!token && !isPublicRoute) {
      router.replace('/login')
    } else if (token && isPublicRoute) {
      router.replace('/dashboard') 
    }
  }, [pathname, router])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-center"
        toastOptions={{
          classNames: {
            error: 'bg-red-400',
            success: 'bg-green-400',
            warning: 'bg-yellow-400',
            info: 'bg-blue-400',
          },
        }} 
      />
    </QueryClientProvider>
  )
}

export default RootProvider