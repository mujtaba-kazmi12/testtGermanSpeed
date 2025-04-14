import axios, { type AxiosResponse } from "axios"
import Cookies from "js-cookie"
import type { AdminStatsResponse, PublisherStatsResponse } from "@/types/admin"

// Create axios instance with base URL
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://newbackend.crective.com",
  timeout: 10000,
})

// Get admin stats
export const getAdminStats = async (): Promise<AdminStatsResponse["data"] | undefined> => {
  try {
    // Get token from cookies
    const token = Cookies.get("token")

    if (!token) {
      console.error("Auth token is missing")
      return undefined
    }

    const response: AxiosResponse<AdminStatsResponse> = await axiosInstance.get(`/v1/admin/get-admin-stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Return the data property from the response
    return response.data.data
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return undefined
  }
}

// Get publisher stats
export const getPublisherStats = async (): Promise<PublisherStatsResponse["data"] | undefined> => {
  try {
    // Get token from cookies
    const token = Cookies.get("token")

    if (!token) {
      console.error("Auth token is missing")
      return undefined
    }

    const response: AxiosResponse<PublisherStatsResponse> = await axiosInstance.get(`/v1/admin/get-publisher-stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Return the data property from the response
    return response.data.data
  } catch (error) {
    console.error("Error fetching publisher stats:", error)
    return undefined
  }
}

