"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { axiosInstance } from "@/lib/api"
import Cookies from "js-cookie"

interface PendingProduct {
  id: string
  siteName: string
  websiteUrl: string
  postingLink: string
  submittedPostUrl: string | null
  // Other fields from the API response
  sampleLink?: string
  price?: string
  adjustedPrice?: string
  language?: string
  niche?: string
  country?: string
  currency?: string
  category?: string[]
  productHandeledBy?: string | null
  poststatus?: string
  linkType?: string
  maxLinkAllowed?: string
  Wordlimit?: string | null
  monthlyTraffic?: string | null
  domainRatings?: string | null
  domainAuthority?: string | null
  turnAroundTime?: string
  liveTime?: string
  siteType?: string
  isProductApprove?: boolean
  rejectionReason?: string | null
  productStatus?: string
  updateFields?: string | null
  createdAt?: string
  updatedAt?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
}

interface NotificationsContextType {
  pendingProducts: PendingProduct[]
  isModalOpen: boolean
  isLoading: boolean
  pagination: PaginationInfo
  openModal: () => void
  closeModal: () => void
  fetchPendingProducts: (page?: number, limit?: number) => Promise<void>
  handleSubmissionSuccess: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
  })

  const fetchPendingProducts = useCallback(async (page = 1, limit = 10) => {
    try {
      setIsLoading(true)
      const token = Cookies.get("token")

      if (!token) {
        console.error("Auth token is missing")
        return
      }

      const response = await axiosInstance.get(`/v1/products/postpending?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data) {
        setPendingProducts(response.data.products || [])

        // Store pagination info
        if (response.data.pagination) {
          setPagination(response.data.pagination)
        }
      }
    } catch (error) {
      console.error("Error fetching pending products:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const openModal = useCallback(() => {
    fetchPendingProducts()
    setIsModalOpen(true)
  }, [fetchPendingProducts])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    fetchPendingProducts()
  }, [fetchPendingProducts])

  const handleSubmissionSuccess = useCallback(() => {
    fetchPendingProducts(pagination.page, pagination.limit)
  }, [fetchPendingProducts, pagination.page, pagination.limit])

  return (
    <NotificationsContext.Provider
      value={{
        pendingProducts,
        isModalOpen,
        isLoading,
        pagination,
        openModal,
        closeModal,
        fetchPendingProducts,
        handleSubmissionSuccess,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}

