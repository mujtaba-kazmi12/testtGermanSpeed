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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// Product type definition
interface Product {
  id: string
  siteName: string
  websiteUrl: string
  sampleLink: string
  price: string
  adjustedPrice: string
  language: string
  niche: string
  country: string
  currency: string
  category: string[]
  productHandeledBy: string | null
  postingLink: string
  poststatus: string
  submittedPostUrl: string
  linkType: string
  maxLinkAllowed: string
  Wordlimit: string | null
  monthlyTraffic: string | null
  domainRatings: string | null
  domainAuthority: string | null
  turnAroundTime: string
  liveTime: string
  siteType: string
  isProductApprove: boolean
  rejectionReason: string | null
  productStatus: string
  updateFields: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
  }
}

export default function AllProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch counts for all tabs
  useEffect(() => {
    fetchCounts()
  }, [])

  // Fetch products for the active tab
  useEffect(() => {
    fetchProducts(activeTab)
  }, [activeTab, page, limit])

  // Fetch counts for all tabs
  const fetchCounts = async () => {
    try {
      const response = await api.get("/v1/products?page=1&limit=1000")
      const allProducts = response.data.products || []

      const pendingCount = allProducts.filter((product: Product) => product.productStatus === "pending").length

      const approvedCount = allProducts.filter((product: Product) => product.productStatus === "approved").length

      const rejectedCount = allProducts.filter((product: Product) => product.productStatus === "rejected").length

      setCounts({
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        all: allProducts.length,
      })

      // Update total pages when counts are fetched
      if (activeTab !== "all") {
        const filteredCount =
          activeTab === "pending" ? pendingCount : activeTab === "approved" ? approvedCount : rejectedCount
        setTotalPages(Math.ceil(filteredCount / limit))
      } else {
        setTotalPages(Math.ceil(allProducts.length / limit))
      }
    } catch (error) {
      console.error("Error fetching counts:", error)
    }
  }

  const fetchProducts = async (status = "pending") => {
    setIsLoading(true)
    try {
      // For filtered views, we need to fetch all products first to get accurate counts
      const response = await api.get(`/v1/products?page=1&limit=1000`)

      console.log(`Fetched products:`, response.data.products) // Debugging

      if (Array.isArray(response.data.products)) {
        let filteredProducts = response.data.products

        // Filter products by status if not "all"
        if (status !== "all") {
          filteredProducts = response.data.products.filter((product: Product) => product.productStatus === status)
        }

        // Calculate total pages based on filtered products
        const totalFilteredProducts = filteredProducts.length
        setTotalPages(Math.ceil(totalFilteredProducts / limit))

        // Apply pagination to the filtered products
        const startIndex = (page - 1) * limit
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit)

        setProducts(paginatedProducts)
      } else {
        console.warn(`Unexpected API response:`, response.data)
        setProducts([])
      }
    } catch (error) {
      console.error(`Error fetching products:`, error)
      toast.error(`Failed to fetch products`, {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please check your network connection and try again.",
      })
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle product approval
  const handleApprove = async (productId: string) => {
    try {
      // Replace with your actual approval API endpoint
      await api.put(`/v1/products/${productId}/approve`)

      // Update counts
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
      }))

      // Refresh products list
      fetchProducts(activeTab)

      toast.success("Product approved successfully")
    } catch (error) {
      console.error("Error approving product:", error)
      toast.error("Failed to approve product", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    }
  }

  // Handle product rejection
  const handleReject = async (productId: string) => {
    try {
      // Replace with your actual rejection API endpoint
      await api.put(`/v1/products/${productId}/reject`)

      // Remove from "Pending" list
      setProducts((prev) => prev.filter((product) => product.id !== productId))

      // Update counts
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        rejected: prev.rejected + 1,
      }))

      // Ensure "Rejected" products get fetched immediately
      if (activeTab === "rejected") {
        fetchProducts("rejected")
      }

      toast.success("Product rejected successfully")
    } catch (error) {
      console.error("Error rejecting product:", error)
      toast.error("Failed to reject product", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    }
  }

  // Handle product deletion
  const handleDelete = async (productId: string) => {
    try {
      // Updated API endpoint for deletion
      await api.delete(`/v1/delete/product/${productId}`)

      // Find the product to determine which count to update
      const productToDelete = products.find((p) => p.id === productId)

      // Update counts
      if (productToDelete) {
        const newCounts = { ...counts, all: counts.all - 1 }

        if (productToDelete.productStatus === "approved") {
          newCounts.approved = Math.max(0, counts.approved - 1)
        } else if (productToDelete.productStatus === "pending") {
          newCounts.pending = Math.max(0, counts.pending - 1)
        } else if (productToDelete.productStatus === "rejected") {
          newCounts.rejected = Math.max(0, counts.rejected - 1)
        }

        setCounts(newCounts)
      }

      // Refresh products list
      fetchProducts(activeTab)

      toast.success("Product deleted successfully")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    }
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      fetchProducts(activeTab)
    } else {
      const filtered = products.filter(
        (product) =>
          product.siteName.toLowerCase().includes(term.toLowerCase()) ||
          product.websiteUrl.toLowerCase().includes(term.toLowerCase()) ||
          product.niche.toLowerCase().includes(term.toLowerCase()),
      )
      setProducts(filtered)
    }
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchTerm("")
    setPage(1) // Reset to first page when changing tabs
    fetchProducts(tab) // Ensure fresh data when switching tabs
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number.parseInt(newLimit))
    setPage(1)
  }

  // View more info
  const handleViewMore = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  // Format currency
  const formatCurrency = (amount: string | null, currency: string) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(Number.parseFloat(amount))
  }

  // Get product status badge color
  const getProductStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "rejected":
        return "bg-rose-100 text-rose-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>Review and manage all products</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
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
                  <span className="text-xs font-normal text-muted-foreground">{counts.pending} products</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-emerald-200 text-emerald-700 p-2 rounded-md">
                  <Check className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Approved</span>
                  <span className="text-xs font-normal text-muted-foreground">{counts.approved} products</span>
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
                  <span className="text-xs font-normal text-muted-foreground">{counts.rejected} products</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-blue-200 text-blue-700 p-2 rounded-md">
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
                  <ProductTable
                    products={products}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onViewMore={handleViewMore}
                    formatCurrency={formatCurrency}
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
            <TabsContent value="approved">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <ProductTable
                    products={products}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onViewMore={handleViewMore}
                    formatCurrency={formatCurrency}
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
                        <ChevronRight className="h-4 w-4 ml-1 " />
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
                  <ProductTable
                    products={products}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onViewMore={handleViewMore}
                    formatCurrency={formatCurrency}
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
                  <ProductTable
                    products={products}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onViewMore={handleViewMore}
                    formatCurrency={formatCurrency}
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
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-3xl bg-white p-4 md:p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold text-gray-800">Product Details</DialogTitle>
          {selectedProduct && (
            <>
              {/* Modal Header */}
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Complete information about {selectedProduct.siteName}</p>
                </div>
              </div>

              {/* Information Column Layout */}
              <div className="flex flex-col gap-4 mt-4">
                {/* Basic Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <ClipboardList className="h-5 w-5 text-gray-500" /> Basic Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">1. Site Name:</span> {selectedProduct.siteName}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">2. Website URL:</span>{" "}
                      <a
                        href={selectedProduct.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedProduct.websiteUrl}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">3. Sample Link:</span>{" "}
                      <a
                        href={selectedProduct.sampleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedProduct.sampleLink}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">4. Price:</span>{" "}
                      {formatCurrency(selectedProduct.price, selectedProduct.currency)}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <Archive className="h-5 w-5 text-gray-500" /> Additional Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">5. Language:</span> {selectedProduct.language}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">6. Niche:</span> {selectedProduct.niche}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">7. Country:</span> {selectedProduct.country}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">8. Categories:</span>{" "}
                      {selectedProduct.category.join(", ")}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">9. Status:</span>
                      <Badge variant="outline" className={getProductStatusColor(selectedProduct.productStatus)}>
                        {selectedProduct.productStatus.charAt(0).toUpperCase() + selectedProduct.productStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <Archive className="h-5 w-5 text-gray-500" /> Technical Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">10. Link Type:</span> {selectedProduct.linkType}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">11. Max Links Allowed:</span>{" "}
                      {selectedProduct.maxLinkAllowed}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">12. Word Limit:</span>{" "}
                      {selectedProduct.Wordlimit || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">13. Monthly Traffic:</span>{" "}
                      {selectedProduct.monthlyTraffic || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">14. Domain Ratings:</span>{" "}
                      {selectedProduct.domainRatings || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">15. Domain Authority:</span>{" "}
                      {selectedProduct.domainAuthority || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">16. Turn Around Time:</span>{" "}
                      {selectedProduct.turnAroundTime} days
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">17. Live Time:</span> {selectedProduct.liveTime}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">18. Site Type:</span> {selectedProduct.siteType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons - Show Accept & Reject ONLY if status is "pending" */}
              <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                <Button
                  onClick={() => {
                    handleDelete(selectedProduct.id)
                    setIsDialogOpen(false)
                  }}
                  className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-lg"
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
                {/* Close Button */}
                <Button
                  variant="outline"
                  className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Product Table Component
function ProductTable({
  products,
  onApprove,
  onReject,
  onDelete,
  onViewMore,
  formatCurrency,
  activeTab,
}: {
  products: Product[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string) => void
  onViewMore: (product: Product) => void
  formatCurrency: (amount: string | null, currency: string) => string
  activeTab: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-slate-100">
            <TableHead className="py-4 text-left">Site Name</TableHead>
            <TableHead className="py-4 text-left">Website URL</TableHead>
            <TableHead className="hidden md:table-cell py-4 text-left">Niche</TableHead>
            <TableHead className="py-4 text-left">Price</TableHead>
            <TableHead className="hidden md:table-cell py-4 text-left">Language</TableHead>
            <TableHead className="hidden lg:table-cell py-4 text-left">Country</TableHead>
            <TableHead className="hidden xl:table-cell py-4 text-left">Status</TableHead>
            <TableHead className="py-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow
                key={product.id}
                className={`${
                  activeTab === "pending"
                    ? "bg-amber-50"
                    : activeTab === "approved"
                      ? "bg-emerald-50"
                      : activeTab === "rejected"
                        ? "bg-rose-50"
                        : activeTab === "all"
                          ? "bg-blue-50"
                          : ""
                } hover:bg-slate-100 transition-colors`}
              >
                <TableCell className="font-medium py-4">{product.siteName}</TableCell>
                <TableCell className="py-4">
                  <div className="truncate md:break-all md:whitespace-normal md:line-clamp-2">
                    <a
                      href={product.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {product.websiteUrl}
                    </a>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell py-4">{product.niche}</TableCell>
                <TableCell className="py-4">
                  <span className="font-medium">{formatCurrency(product.price, product.currency)}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell py-4">{product.language}</TableCell>
                <TableCell className="hidden lg:table-cell py-4">{product.country}</TableCell>
                <TableCell className="hidden xl:table-cell py-4">
                  <Badge
                    variant="outline"
                    className={`${
                      product.productStatus === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : product.productStatus === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {product.productStatus.charAt(0).toUpperCase() + product.productStatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex justify-end gap-2">
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
                          onClick={() => onViewMore(product)}
                          className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                        >
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(product.id)}
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