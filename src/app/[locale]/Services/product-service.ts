import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface Product {
  id: string
  siteName?: string
  title?: string
  category?: string[] | string
  author?: string
  productHandeledBy?: string
  rating: number
  views?: number
  price: number | string
  dateAdded?: Date | string
  createdAt?: string
  updatedAt?: string
  da?: number
  dr?: number
  domainAuthority?: number
  domainRatings?: number
  monthlyTraffic?: number
  country?: string
  websiteUrl?: string
  sampleLink?: string
  adjustedPrice?: string
  language?: string
  niche?: string
  currency?: string
  postingLink?: string
  poststatus?: string
  submittedPostUrl?: string
  linkType?: string
  maxLinkAllowed?: string
  Wordlimit?: string
  turnAroundTime?: string
  liveTime?: string
  siteType?: string
  isProductApprove?: boolean
  rejectionReason?: string | null
  productStatus?: string
  updateFields?: string | null
  metadata?: Record<string, any>
  email?: string
  description?: string
  tags?: string[] | string
  url?: string
  notes?: string
  comments?: string  
  user?: {
    id: string
  }
}

export interface Pagination {
  page: number
  limit: number
  total: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface ApiResponse {
  items: Product[]
  page: number
  limit: number
  total: number
}

export const TableData = async (
  setError: (error: string | null) => void,
  page = 1,
  limit = 9,
  filters: {
    minDA?: string
    maxDA?: string
    minDR?: string
    maxDR?: string
    minPrice?: string
    maxPrice?: string
    categories?: string[]
    country?: string
    searchTerm?: string
  } = {},
): Promise<ApiResponse | null> => {
  try {
    const token = Cookies.get("token")

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      country: "Germany",
    })

    if (filters.minPrice) params.append("minPrice", filters.minPrice)
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice)
    if (filters.minDA) params.append("minDA", filters.minDA)
    if (filters.maxDA) params.append("maxDA", filters.maxDA)
    if (filters.minDR) params.append("minDR", filters.minDR)
    if (filters.maxDR) params.append("maxDR", filters.maxDR)
    if (filters.searchTerm) params.append("search", filters.searchTerm)
    filters.categories?.forEach((category) => {
      params.append("category", category)
    })

    const fullUrl = `${API_BASE_URL}/v1/get/products?${params.toString()}`

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    try {
      const data = JSON.parse(responseText)
      return data
    } catch {
      throw new Error("Invalid JSON response from server")
    }
  } catch (error) {
    setError(`Failed to fetch products: ${error instanceof Error ? error.message : "Unknown error"}`)
    return null
  }
}


