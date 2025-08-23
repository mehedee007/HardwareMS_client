"use client"

import { authApis } from "@/apis/auth"
import useStore from "@/store"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { ReactNode, useEffect, useState } from "react"
import Cookies from "js-cookie"
import { constents } from "@/constents"

function PrivateProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const setUserData = useStore((state) => state.setLoginUser)
  const user = useStore((state) => state.loginUser)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchUserData() {
    try {
      setLoading(true)
      setError(null)

      const response = await authApis.profileData()
      if (response) {
        setUserData(response)
      } else {
        throw new Error("No user data received")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setError("Failed to verify your session. Please login again.")
      // Clear any invalid token
      Cookies.remove(constents.AUTH_KEY)
      // Redirect after short delay to allow error message to show
      setTimeout(() => router.push("/login"), 1500)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const isTokenExist = Cookies.get(constents.AUTH_KEY)

    if (!isTokenExist) {
      router.push("/login")
      return
    }

    // If we already have user data, no need to fetch again
    if (user) {
      setLoading(false)
      return
    }

    fetchUserData()

    // Cleanup function
    return () => {
      // Cancel any ongoing requests if component unmounts
      // You might need to implement cancellation in your authApis
    }
  }, [router, user, setUserData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error}</p>
        <Link
          className="text-blue-600 hover:text-blue-800 transition-colors"
          href="/login"
        >
          Redirecting to login page...
        </Link>
      </div>
    )
  }

  return <>{children}</>
}

export default PrivateProvider