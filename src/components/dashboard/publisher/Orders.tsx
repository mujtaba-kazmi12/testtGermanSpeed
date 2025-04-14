"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import {
  Archive,
  Check,
  ClipboardList,
  EyeIcon,
  Inbox,
  LayoutGrid,
  MoreHorizontal,
  Search,
  Trash,
  X,
  ChevronLeft,
  ChevronRight,
  LinkIcon,
  CreditCard,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Custom CSS for text wrapping
const styles = `
  .truncate-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }
  
  .overflow-wrap-anywhere {
    overflow-wrap: anywhere;
  }
`

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

// Order type definition
interface Order {
  id: string
  orderNumber: string | number
  totalAmount: string
  orderStatus: "pending" | "accepted" | "rejected" | "inProgress" | "completed" | "submitted"
  rejectionReason: string | null
  submissionUrl: string | null
  submissionDetails: string | null
  submissionDate: string | null
  notes: string | null
  backupEmail: string
  payment_status: string
  createdAt: string
  updatedAt: string
  products: Array<{
    siteName: string
    productId: string
    niche: string
    currency: string
    adjustedPrice: string
    language: string
    domainAuthority: number
    domainRatings: number
    monthlyTraffic: number
    turnAroundTime: string
  }>
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    backupEmail: string
  }
}

export default function AllOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [submittedLink, setSubmittedLink] = useState("")
  const [submittedDetails, setSubmittedDetails] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [counts, setCounts] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    all: 0,
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [allOrders, setAllOrders] = useState<Order[]>([]) // Store all orders for client-side filtering

  // Fetch all orders once
  useEffect(() => {
    fetchAllOrders()
  }, [])

  // Apply filters and pagination when tab, page, or limit changes
  useEffect(() => {
    if (allOrders.length > 0) {
      applyFiltersAndPagination(activeTab)
    }
  }, [activeTab, page, limit, allOrders])

  // Fetch all orders from API
  const fetchAllOrders = async () => {
    setIsLoading(true)
    try {
      // Fetch all orders with a large limit
      const response = await api.get("/v1/order/publisher?page=1&limit=1000")
      console.log("API Response:", response.data) // Debug log

      if (response.data && Array.isArray(response.data.items)) {
        const fetchedOrders = response.data.items
        setAllOrders(fetchedOrders)

        // Calculate counts
        const pendingCount = fetchedOrders.filter((order: Order) => order.orderStatus === "pending").length
        const acceptedCount = fetchedOrders.filter((order: Order) =>
          ["accepted", "inProgress", "completed", "submitted"].includes(order.orderStatus),
        ).length
        const rejectedCount = fetchedOrders.filter((order: Order) => order.orderStatus === "rejected").length

        setCounts({
          pending: pendingCount,
          accepted: acceptedCount,
          rejected: rejectedCount,
          all: fetchedOrders.length,
        })

        // Apply initial filters and pagination
        applyFiltersAndPagination(activeTab)
      } else {
        console.warn(`Unexpected API response:`, response.data)
        setAllOrders([])
        setOrders([])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to fetch orders", {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please check your network connection and try again.",
      })
      setAllOrders([])
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters and pagination to the orders
  const applyFiltersAndPagination = (status = "pending") => {
    // Apply status filter
    let filteredOrders = [...allOrders]

    if (status === "pending") {
      filteredOrders = filteredOrders.filter((order) => order.orderStatus === "pending")
    } else if (status === "accepted") {
      filteredOrders = filteredOrders.filter((order) =>
        ["accepted", "inProgress", "completed", "submitted"].includes(order.orderStatus),
      )
    } else if (status === "rejected") {
      filteredOrders = filteredOrders.filter((order) => order.orderStatus === "rejected")
    }

    // Apply search filter if search term exists
    if (searchTerm.trim() !== "") {
      filteredOrders = filteredOrders.filter(
        (order) =>
          String(order.orderNumber).toLowerCase().includes(searchTerm.toLowerCase()) ||
          ((order.user?.firstName || "") + " " + (order.user?.lastName || ""))
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.products &&
            order.products.length > 0 &&
            order.products[0].siteName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Calculate total pages
    const totalFilteredOrders = filteredOrders.length
    setTotalPages(Math.ceil(totalFilteredOrders / limit))

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit)

    setOrders(paginatedOrders)
  }

  // Handle order acceptance
  const handleAccept = async (orderId: string) => {
    try {
      // Send only the orderId without any price data
      await api.put(`/v1/order/accepted/${orderId}`, { orderId })

      // Update the order status in allOrders
      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, orderStatus: "accepted" as Order["orderStatus"] } : order,
        ),
      )

      // Update counts
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        accepted: prev.accepted + 1,
      }))

      // Refresh filtered orders
      applyFiltersAndPagination(activeTab)
      setIsAcceptDialogOpen(false)

      toast.success("Order accepted successfully")
    } catch (error) {
      console.error("Error accepting order:", error)
      toast.error("Failed to accept order", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    }
  }

  // Handle order rejection
  const handleReject = async (orderId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error("Rejection reason is required")
      return
    }

    try {
      await api.put(`/v1/order/rejected/${orderId}`, { rejectionReason: reason })

      // Update the order status in allOrders
      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, orderStatus: "rejected" as Order["orderStatus"], rejectionReason: reason }
            : order,
        ),
      )

      // Update counts
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        rejected: prev.rejected + 1,
      }))

      // Refresh filtered orders
      applyFiltersAndPagination(activeTab)
      setIsRejectDialogOpen(false)
      setRejectionReason("")

      toast.success("Order rejected successfully")
    } catch (error) {
      console.error("Error rejecting order:", error)
      toast.error("Failed to reject order", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    }
  }

  // Handle order status update
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // If status is "submitted", open the submission dialog
      if (newStatus === "submitted") {
        setSelectedOrder(allOrders.find((order) => order.id === orderId) || null)
        setIsSubmitDialogOpen(true)
        return
      }

      await api.put(`/v1/order/status/updateById/${orderId}`, {
        orderStatus: newStatus,
      })

      // Update the order status in allOrders
      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, orderStatus: newStatus as Order["orderStatus"] } : order,
        ),
      )

      // Refresh filtered orders
      applyFiltersAndPagination(activeTab)

      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    }
  }

  // Handle order submission
  const handleSubmit = async (orderId: string, link: string, details: string) => {
    if (!link.trim()) {
      toast.error("Submitted link is required")
      return
    }

    try {
      // Updated payload with exact field names expected by the API
      await api.put(`/v1/order/submit/${orderId}`, {
        submissionUrl: link,
        submissionDetails: details,
      })

      // Update the order in allOrders
      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                orderStatus: "submitted" as Order["orderStatus"],
                submissionUrl: link,
                submissionDetails: details,
                submissionDate: new Date().toISOString(),
              }
            : order,
        ),
      )

      // Refresh filtered orders
      applyFiltersAndPagination(activeTab)
      setIsSubmitDialogOpen(false)
      setSubmittedLink("")
      setSubmittedDetails("")

      toast.success("Order submitted successfully")
    } catch (error) {
      console.error("Error submitting order:", error)
      toast.error("Failed to submit order", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    }
  }

  // Handle order deletion
  const handleDelete = async (orderId: string) => {
    try {
      // This is a placeholder. You'll need to provide the actual delete API endpoint
      await api.delete(`/v1/order/${orderId}`)

      // Find the order to determine which count to update
      const orderToDelete = allOrders.find((o) => o.id === orderId)

      // Remove the order from allOrders
      setAllOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))

      // Update counts
      if (orderToDelete) {
        const newCounts = { ...counts, all: counts.all - 1 }

        if (orderToDelete.orderStatus === "pending") {
          newCounts.pending = Math.max(0, counts.pending - 1)
        } else if (["accepted", "inProgress", "completed", "submitted"].includes(orderToDelete.orderStatus)) {
          newCounts.accepted = Math.max(0, counts.accepted - 1)
        } else if (orderToDelete.orderStatus === "rejected") {
          newCounts.rejected = Math.max(0, counts.rejected - 1)
        }

        setCounts(newCounts)
      }

      // Refresh filtered orders
      applyFiltersAndPagination(activeTab)

      toast.success("Order deleted successfully")
    } catch (error) {
      console.error("Error deleting order:", error)
      toast.error("Failed to delete order", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    }
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    // Apply filters with the new search term
    applyFiltersAndPagination(activeTab)
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchTerm("")
    setPage(1) // Reset to first page when changing tabs
    applyFiltersAndPagination(tab) // Apply filters for the new tab
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number.parseInt(newLimit))
    setPage(1)
  }

  // View more info
  const handleViewMore = (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  // Format currency
  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(Number.parseFloat(amount))
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get order status badge color
  const getOrderStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "inProgress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-emerald-100 text-emerald-800"
      case "submitted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-rose-100 text-rose-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  // Get formatted status text
  const getFormattedStatus = (status: string): string => {
    switch (status) {
      case "inProgress":
        return "In Progress"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
          <div className=" flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="">
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Review and manage all orders</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto h-auto">
          <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6 p-6 bg-slate-200 lg:h-[50px] h-[auto] rounded-lg w-full grid grid-cols-2 gap-4 md:flex md:flex-row md:justify-between md:gap-1">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-amber-200 text-amber-700 p-2 rounded-md">
                  <Inbox className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Pending</span>
                  <span className="text-xs font-normal text-muted-foreground">{counts.pending} orders</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="accepted"
                className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-green-200 text-green-700 p-2 rounded-md">
                  <Check className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Accepted</span>
                  <span className="text-xs font-normal text-muted-foreground">{counts.accepted} orders</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-rose-200 text-rose-700 p-2 rounded-md">
                  <X className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Rejected</span>
                  <span className="text-xs font-normal text-muted-foreground">{counts.rejected} orders</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-blue-300 text-blue-700 p-2 rounded-md">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>All</span>
                  <span className="text-xs font-normal text-muted-foreground">{counts.all} total</span>
                </div>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <OrderTable
                    orders={orders}
                    onAccept={(order) => {
                      setSelectedOrder(order)
                      setIsAcceptDialogOpen(true)
                    }}
                    onReject={(order) => {
                      setSelectedOrder(order)
                      setIsRejectDialogOpen(true)
                    }}
                    onStatusChange={handleStatusUpdate}
                    onDelete={handleDelete}
                    onViewMore={handleViewMore}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getOrderStatusColor={getOrderStatusColor}
                    getFormattedStatus={getFormattedStatus}
                    activeTab={activeTab}
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1 rounded-full " />
                      </Button>
                      <div className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                        className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
                      >
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="accepted">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <OrderTable
                    orders={orders}
                    onAccept={(order) => {
                      setSelectedOrder(order)
                      setIsAcceptDialogOpen(true)
                    }}
                    onReject={(order) => {
                      setSelectedOrder(order)
                      setIsRejectDialogOpen(true)
                    }}
                    onStatusChange={handleStatusUpdate}
                    onDelete={handleDelete}
                    onViewMore={handleViewMore}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getOrderStatusColor={getOrderStatusColor}
                    getFormattedStatus={getFormattedStatus}
                    activeTab={activeTab}
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {/* Previous */}
                      </Button>
                      <div className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                        className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
                      >
                        {/* Next */}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="rejected">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <OrderTable
                    orders={orders}
                    onAccept={(order) => {
                      setSelectedOrder(order)
                      setIsAcceptDialogOpen(true)
                    }}
                    onReject={(order) => {
                      setSelectedOrder(order)
                      setIsRejectDialogOpen(true)
                    }}
                    onStatusChange={handleStatusUpdate}
                    onDelete={handleDelete}
                    onViewMore={handleViewMore}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getOrderStatusColor={getOrderStatusColor}
                    getFormattedStatus={getFormattedStatus}
                    activeTab={activeTab}
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {/* Previous */}
                      </Button>
                      <div className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                        className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
                      >
                        {/* Next */}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <OrderTable
                    orders={orders}
                    onAccept={(order) => {
                      setSelectedOrder(order)
                      setIsAcceptDialogOpen(true)
                    }}
                    onReject={(order) => {
                      setSelectedOrder(order)
                      setIsRejectDialogOpen(true)
                    }}
                    onStatusChange={handleStatusUpdate}
                    onDelete={handleDelete}
                    onViewMore={handleViewMore}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getOrderStatusColor={getOrderStatusColor}
                    getFormattedStatus={getFormattedStatus}
                    activeTab={activeTab}
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
                      >
                        {/* Previous */}
                        <ChevronLeft className="h-4 w-4 mr-1" />
                      </Button>
                      <div className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                        className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex"
                      >
                        {/* Next */}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-2xl bg-white p-0 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <DialogTitle className="text-xl font-semibold">Order Details</DialogTitle>
                <div className="text-sm text-gray-500 mt-1">
                  Order #{selectedOrder?.orderNumber} -{" "}
                  {selectedOrder?.createdAt && formatDate(selectedOrder.createdAt)}
                </div>
              </div>
              <Badge variant="outline" className={selectedOrder ? getOrderStatusColor(selectedOrder.orderStatus) : ""}>
                {selectedOrder ? getFormattedStatus(selectedOrder.orderStatus) : ""}
              </Badge>
            </div>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-4 text-gray-700">
                    <ClipboardList className="h-5 w-5 text-gray-500" /> Order Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-medium text-gray-500 w-40">Total Amount:</span>
                      {selectedOrder.products && selectedOrder.products.length > 0
                        ? formatCurrency(selectedOrder.products[0].adjustedPrice, selectedOrder.products[0].currency)
                        : formatCurrency(selectedOrder.totalAmount, "USD")}
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-500 w-40">Content Provided By:</span>
                      <span>{selectedOrder.user ? "User" : "N/A"}</span>
                    </div>
                    {selectedOrder.submissionUrl && (
                      <div className="flex">
                        <span className="font-medium text-gray-500 w-40">File:</span>
                        <a
                          href={selectedOrder.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          View File <EyeIcon className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div className="flex">
                        <span className="font-medium text-gray-500 w-40">Notes:</span>
                        <span>{selectedOrder.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-4 text-gray-700">
                    <CreditCard className="h-5 w-5 text-gray-500" /> Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-medium text-gray-500 w-40">Payment Status:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                      {selectedOrder.payment_status}
                      </Badge>
                    </div>
                    {selectedOrder.products && selectedOrder.products.length > 0 && (
                      <>
                        <div className="flex">
                          <span className="font-medium text-gray-500 w-40">Payer Amount:</span>
                          <span>
                            {formatCurrency(
                              selectedOrder.products[0].adjustedPrice,
                              selectedOrder.products[0].currency,
                            )}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-500 w-40">Network:</span>
                          <span>{selectedOrder.products[0].currency}</span>
                        </div>
                      </>
                    )}
                    <div className="flex">
                      <span className="font-medium text-gray-500 w-40">Expires:</span>
                      <span>{formatDate(selectedOrder.updatedAt)}</span>
                    </div>
                    {selectedOrder.submissionUrl && (
                      <div className="flex">
                        <span className="font-medium text-gray-500 w-40">Payment URL:</span>
                        <a
                          href={selectedOrder.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          View Payment Link <LinkIcon className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-4 text-gray-700">
                    <User className="h-5 w-5 text-gray-500" /> Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-medium text-gray-500 w-40">Name:</span>
                      <span>
                        {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-500 w-40">Email:</span>
                      <span>{selectedOrder.user?.email}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-500 w-40">Backup Email:</span>
                      <span>{selectedOrder.backupEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Products Information */}
                {selectedOrder.products && selectedOrder.products.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-base font-medium flex items-center gap-2 mb-4 text-gray-700">
                      <Archive className="h-5 w-5 text-gray-500" /> Products
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.products.map((product, index) => (
                        <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{product.siteName}</h4>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              {product.language}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="flex">
                              <span className="font-medium text-gray-500 w-40">Niche:</span>
                              <span>{product.niche}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium text-gray-500 w-40">Price:</span>
                              <span>{formatCurrency(product.adjustedPrice, product.currency)}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium text-gray-500 w-40">Domain Authority:</span>
                              <span>{product.domainAuthority}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium text-gray-500 w-40">Domain Ratings:</span>
                              <span>{product.domainRatings}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium text-gray-500 w-40">Monthly Traffic:</span>
                              <span>{product.monthlyTraffic}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium text-gray-500 w-40">Turn Around Time:</span>
                              <span>{product.turnAroundTime}</span>
                            </div>
                            {/* <div className="col-span-2">
                              <span className="font-medium text-gray-500">Categories:</span>
                              <span className="ml-2">N/A</span>
                            </div> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button variant="outline" className="px-6" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept Confirmation Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <p className="text-sm text-muted-foreground">
                Order #{selectedOrder?.orderNumber} -{" "}
                {selectedOrder?.products && selectedOrder.products.length > 0
                  ? selectedOrder.products[0].siteName
                  : "N/A"}
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md"
              onClick={() => selectedOrder && handleAccept(selectedOrder.id)}
            >
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this order.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                Order #{selectedOrder?.orderNumber} -{" "}
                {selectedOrder?.products && selectedOrder.products.length > 0
                  ? selectedOrder.products[0].siteName
                  : "N/A"}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason" className="text-left">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please explain why this order is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRejectionReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md py-5"
              onClick={() => selectedOrder && handleReject(selectedOrder.id, rejectionReason)}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Order</DialogTitle>
            <DialogDescription>Please provide the submission details for this order.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                Order #{selectedOrder?.orderNumber} -{" "}
                {selectedOrder?.products && selectedOrder.products.length > 0
                  ? selectedOrder.products[0].siteName
                  : "N/A"}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="submitted-link" className="text-left">
                Submitted Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="submitted-link"
                placeholder="https://example.com/submission"
                value={submittedLink}
                onChange={(e) => setSubmittedLink(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="submitted-details" className="text-left">
                Additional Details
              </Label>
              <Textarea
                id="submitted-details"
                placeholder="Any additional information about the submission..."
                value={submittedDetails}
                onChange={(e) => setSubmittedDetails(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSubmitDialogOpen(false)
                setSubmittedLink("")
                setSubmittedDetails("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => selectedOrder && handleSubmit(selectedOrder.id, submittedLink, submittedDetails)}
              disabled={!submittedLink.trim()}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Order Table Component
function OrderTable({
  orders,
  onAccept,
  onReject,
  onStatusChange,
  onDelete,
  onViewMore,
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getFormattedStatus,
  activeTab,
}: {
  orders: Order[]
  onAccept: (order: Order) => void
  onReject: (order: Order) => void
  onStatusChange: (orderId: string, status: string) => void
  onDelete: (orderId: string) => void
  onViewMore: (order: Order) => void
  formatCurrency: (amount: string, currency: string) => string
  formatDate: (dateString: string) => string
  getOrderStatusColor: (status: string) => string
  getFormattedStatus: (status: string) => string
  activeTab: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-slate-100">
            <TableHead className="py-4 text-left">Order #</TableHead>
            <TableHead className="py-4 text-left">Customer</TableHead>
            <TableHead className="hidden md:table-cell py-4 text-left">Product</TableHead>
            <TableHead className="py-4 text-left">Price</TableHead>
            <TableHead className="hidden md:table-cell py-4 text-left">Date</TableHead>
            <TableHead className="hidden lg:table-cell py-4 text-left">Status</TableHead>
            <TableHead className="py-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!orders || orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order.id}
                className={`${
                  activeTab === "pending"
                    ? "bg-amber-50"
                    : activeTab === "accepted"
                      ? "bg-blue-50"
                      : activeTab === "rejected"
                        ? "bg-rose-50"
                        : activeTab === "all"
                          ? "bg-slate-50"
                          : ""
                } hover:bg-slate-100 transition-colors`}
              >
                <TableCell className="font-medium py-4">{order.orderNumber}</TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span>
                      {order.user?.firstName || ""} {order.user?.lastName || ""}
                    </span>
                    <span className="text-xs text-muted-foreground">{order.user?.email || ""}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell py-4">
                  {order.products && order.products.length > 0 ? order.products[0].siteName : "N/A"}
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-medium">
                    {order.products && order.products.length > 0
                      ? formatCurrency(order.products[0].adjustedPrice, order.products[0].currency)
                      : formatCurrency(order.totalAmount || "0", "USD")}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell py-4">{formatDate(order.createdAt)}</TableCell>
                <TableCell className="hidden lg:table-cell py-4">
                  <Badge variant="outline" className={getOrderStatusColor(order.orderStatus)}>
                    {getFormattedStatus(order.orderStatus)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex justify-end gap-2">
                    {activeTab === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAccept(order)}
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Accept</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(order)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                      </>
                    )}
                    {activeTab === "accepted" && (
                      <Select
                        defaultValue={order.orderStatus}
                        onValueChange={(value) => onStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="inProgress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border border-slate-200 shadow-lg">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onViewMore(order)}
                          className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                        >
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(order.id)}
                          className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
