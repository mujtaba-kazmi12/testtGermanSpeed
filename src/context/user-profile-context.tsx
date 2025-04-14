"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { axiosInstance } from "@/lib/api"
import Cookies from "js-cookie"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  phoneNo: string
  country: string
  currency: string
  ownsSite: boolean
  numberOfSites: number
  hasDoFollowLinks: boolean
  sellingArticles: boolean
  sellingArticlesUrl: string | null
  businessName: string
  businessType: string | null
  walletAddress: string
  walletBalance: number
  referralCode: string
  isaffiliateRequested: boolean
  isAffiliate: boolean
  isApproved: boolean
  approvedby: string | null
  otp: string | null
  otpExpiresAt: string | null
  isVerified: boolean
  monthlyBudget: string | null
  referedBy: string
  permissions: string | null
  comissions: string | null
  resetPasswordToken: string | null
  resetPasswordExpiresAt: string | null
}

interface UserProfileContextType {
  userProfile: UserProfile | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  fetchUserProfile: () => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = Cookies.get("token")
      if (!token) {
        setIsAuthenticated(false)
        setUserProfile(null)
        setIsLoading(false)
        return
      }

      setIsAuthenticated(true)

      const response = await axiosInstance.get("/v1/auth/get-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data) {
        setUserProfile(response.data)
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err)
      setError("Failed to load user profile")
      
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false)
        setUserProfile(null)
        Cookies.remove("token")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (Cookies.get("token")) {
      fetchUserProfile()
    } else {
      setIsAuthenticated(false)
      setUserProfile(null)
      setIsLoading(false)
    }
  }, [])

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        isLoading,
        error,
        fetchUserProfile,
        isAuthenticated,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider")
  }
  return context
}

