"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

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

interface InvoicesListProps {
  invoices: Invoice[]
  isLoading: boolean
  error: string | null
  api: any
}

export function InvoicesList({ invoices, isLoading, error, api }: InvoicesListProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)

  // Calculate total pages
  const totalItems = invoices?.length || 0
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  // Get current page of invoices
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const currentInvoices = invoices?.slice(startIndex, endIndex) || []

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number.parseInt(newLimit))
    setPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format date without date-fns
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Loading invoices...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-center border-t p-4">
          <Skeleton className="h-10 w-64" />
        </CardFooter>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Error loading invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>View and manage your invoice history</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-muted p-6">
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No data</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            You don't have any invoices yet. When you do, they'll appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>View and manage your invoice history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left font-medium">Invoice #</th>
                <th className="py-3 text-left font-medium">Date</th>
                <th className="py-3 text-right font-medium">Amount</th>
                <th className="py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b">
                  <td className="py-3">{invoice.invoiceNumber}</td>
                  <td className="py-3">{formatDate(invoice.createdAt)}</td>
                  <td className="py-3 text-right">
                    {invoice.amount} {invoice.currency}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.InvoiceStatus)}`}
                    >
                      {invoice.InvoiceStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-center border-t p-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousPage} disabled={page === 1}
            className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextPage} disabled={page === totalPages}
            className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-4 flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Items per page</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={limit.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  )
}

