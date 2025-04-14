"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { FinancialOverview } from "@/components/financial-dashboard/financial-overview"
import { InvoiceStatus } from "@/components/financial-dashboard/invoice-status"
import { InvoicesList } from "@/components/financial-dashboard/invoices-list"
import { PaymentMethodForm } from "@/components/financial-dashboard/payment-method-form"
// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Add request interceptor to add auth token to all requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface ProfileData {
  walletBalance: number
  currency: string
  walletAddress: string
  firstName: string
  lastName: string
  email: string
  // other fields omitted for brevity
}

interface Invoice {
  id: string
  amount: string
  invoiceNumber: string
  walletAddress: string
  currency: string
  InvoiceStatus: string
  createdAt: string
  adminApprovalDate: string | null
  superAdminPayoutDate: string | null
  rejectionReason: string | null
  updatedAt: string
  withdrawalRequest: string | null
  approvedBy: string | null
}

export default function Widthdrawl() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch profile data
  const fetchProfileData = useCallback(async () => {
    try {
      const profileResponse = await api.get("/v1/auth/get-profile")
      setProfileData(profileResponse.data)
    } catch (err) {
      console.error("Error fetching profile data:", err)
      // Don't set error here to avoid overriding the main error state
    }
  }, [])

  // Function to fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      const invoicesResponse = await api.get("/v1/fetchInvoices")
      setInvoices(invoicesResponse.data.data || [])
    } catch (err) {
      console.error("Error fetching invoices:", err)
      // Don't set error here to avoid overriding the main error state
    }
  }, [])

  // Function to refresh all data after a withdrawal
  const refreshDataAfterWithdrawal = useCallback(async () => {
    try {
      // Fetch both profile and invoice data
      await Promise.all([fetchProfileData(), fetchInvoices()])
    } catch (err) {
      console.error("Error refreshing data after withdrawal:", err)
    }
  }, [fetchProfileData, fetchInvoices])

  // Function to fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Fetch both profile and invoice data
      await Promise.all([fetchProfileData(), fetchInvoices()])

      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }, [fetchProfileData, fetchInvoices])

  // Initial data fetch
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Count invoices by status
  const getInvoiceCount = (status: string): number => {
    if (!invoices || !Array.isArray(invoices)) return 0
    return invoices.filter((invoice) => invoice.InvoiceStatus === status).length
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid gap-6 md:grid-cols-4">
        <FinancialOverview profileData={profileData} isLoading={isLoading} error={error} />
        <InvoiceStatus type="pending" count={getInvoiceCount("pending")} isLoading={isLoading} />
        <InvoiceStatus type="approved" count={getInvoiceCount("approved")} isLoading={isLoading} />
        <InvoiceStatus type="rejected" count={getInvoiceCount("rejected")} isLoading={isLoading} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PaymentMethodForm
          profileData={profileData}
          isLoading={isLoading}
          error={error}
          api={api}
          onWithdrawalSuccess={refreshDataAfterWithdrawal}
        />
        <InvoicesList invoices={invoices} isLoading={isLoading} error={error} api={api} />
      </div>
    </div>
  )
}
