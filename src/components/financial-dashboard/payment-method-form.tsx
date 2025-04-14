"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { Skeleton } from "@/components/ui/skeleton"

interface ProfileData {
  walletBalance: number
  currency: string
  walletAddress: string
  firstName: string
  lastName: string
  email: string
  // other fields omitted for brevity
}

interface PaymentMethodFormProps {
  profileData: ProfileData | null
  isLoading: boolean
  error: string | null
  api: any
  onWithdrawalSuccess: () => Promise<void>
}

// Define the error response structure
interface ErrorResponse {
  message?: string
  error?: string
  statusCode?: number
}

export function PaymentMethodForm({ profileData, isLoading, error, api, onWithdrawalSuccess }: PaymentMethodFormProps) {
  const [currency, setCurrency] = useState(profileData?.currency || "USD")
  const [walletAddress, setWalletAddress] = useState(profileData?.walletAddress || "")
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Update state when profileData changes
  if (profileData && profileData.currency !== currency) {
    setCurrency(profileData.currency)
  }

  if (profileData && profileData.walletAddress !== walletAddress) {
    setWalletAddress(profileData.walletAddress)
  }

  const handleWithdrawalRequest = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setSubmitting(true)
    try {
      await api.post("/v1/withdrawal/request", {
        amount: Number.parseFloat(amount),
        currency,
        walletAddress,
      })

      toast.success("Withdrawal request submitted successfully")
      setAmount("")

      // Refresh both profile and invoice data after successful withdrawal
      await onWithdrawalSuccess()
    } catch (err) {
      console.error("Error submitting withdrawal request:", err)
      const axiosError = err as AxiosError<ErrorResponse>

      // Safely access the error message
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        "An error occurred"

      toast.error("Failed to submit withdrawal request", {
        description: errorMessage,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Loading payment details...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Label>Withdrawal Amount</Label>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Error loading payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment details</CardDescription>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md py-5" onClick={handleWithdrawalRequest} disabled={submitting}>
          <PlusCircle className="h-4 w-4" />
          {submitting ? "Processing..." : "Add New Request"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
      <div className="space-y-2">
          <Label htmlFor="amount">Withdrawal Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount to withdraw"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" value={currency} onChange={(e) => setWalletAddress(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wallet-address">Wallet Address</Label>
          <Input id="wallet-address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
        </div>
      </CardContent>
    </Card>
  )
}

