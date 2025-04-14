"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  EyeIcon,
  Inbox,
  LayoutGrid,
  MoreHorizontal,
  Search,
  Trash,
  X,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Product } from "@/types/product"
import { toast } from "sonner"
import usePermissions from "@/hooks/usePermissions"

// Custom CSS for email text wrapping
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

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([]) // Store all products
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]) // Store filtered products
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  })
  const [approvalData, setApprovalData] = useState({
    domainRatings: 0,
    domainAuthority: 0,
    monthlyTraffic: 0,
  })
  const [rejectionReason, setRejectionReason] = useState("")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  })

  // Fetch counts for all tabs
  useEffect(() => {
    fetchCounts()
  }, [])

  // Fetch products for the active tab
  useEffect(() => {
    fetchProducts(activeTab)
  }, [activeTab])

  // Update filtered products when search term changes
  useEffect(() => {
    filterProducts()
  }, [searchTerm, allProducts])

  // Update pagination when filtered products change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1, // Reset to first page when filtered products change
      totalPages: Math.max(1, Math.ceil(filteredProducts.length / prev.itemsPerPage)),
    }))
  }, [filteredProducts])

  // Update pagination when items per page changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalPages: Math.ceil(filteredProducts.length / prev.itemsPerPage),
    }))
  }, [pagination.itemsPerPage, filteredProducts])

  // Fetch counts for all tabs
  const fetchCounts = async () => {
    try {
      const pendingResponse = await api.get("/v1/admin/get-products?status=pending")
      const approvedResponse = await api.get("/v1/admin/get-products?status=approved")
      const rejectedResponse = await api.get("/v1/admin/get-products?status=rejected")
      const allResponse = await api.get("/v1/admin/get-products?status=all")

      setCounts({
        pending: pendingResponse.data.data?.length || 0,
        approved: approvedResponse.data.data?.length || 0,
        rejected: rejectedResponse.data.data?.length || 0,
        all: allResponse.data.data?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching counts:", error)
    }
  }

  const fetchProducts = async (status = "pending") => {
    setIsLoading(true)
    try {
      // Fetch all products for the current status without pagination parameters
      const response = await api.get(`/v1/admin/get-products?status=${status}`)

      console.log(`Fetched ${status} products:`, response.data.data) // Debugging

      if (Array.isArray(response.data.data)) {
        setAllProducts(response.data.data)
        setFilteredProducts(response.data.data) // Initially, filtered products are the same as all products
      } else {
        console.warn(`Unexpected API response for ${status}:`, response.data)
        setAllProducts([])
        setFilteredProducts([])
      }
    } catch (error) {
      console.error(`Error fetching ${status} products:`, error)
      toast.error(`Failed to fetch ${status} products`, {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please check your network connection and try again.",
      })
      setAllProducts([])
      setFilteredProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter products based on search term
  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(allProducts)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = allProducts.filter(
      (product) =>
        product.siteName.toLowerCase().includes(term) ||
        product.websiteUrl.toLowerCase().includes(term) ||
        product.niche.toLowerCase().includes(term) ||
        (product.category && product.category.some((cat) => cat.toLowerCase().includes(term))),
    )
    setFilteredProducts(filtered)
  }

  // Get paginated products
  const getPaginatedProducts = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
    const endIndex = startIndex + pagination.itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }

  // Handle product approval
  const handleApprove = async (productId: string) => {
    try {
      await api.put(`/v1/admin/approve-product/${productId}`, {
        domainRatings: approvalData.domainRatings,
        domainAuthority: approvalData.domainAuthority,
        monthlyTraffic: approvalData.monthlyTraffic,
      })

      // Update counts
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
      }))

      // Refresh products list
      fetchProducts(activeTab)

      // Close modal
      setIsApproveModalOpen(false)
      setSelectedProduct(null)

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
      await api.put(`/v1/admin/reject-product/${productId}`, {
        rejectionReason: rejectionReason,
      })

      // Update counts
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        rejected: prev.rejected + 1,
      }))

      // Refresh products list
      fetchProducts(activeTab)

      // Close modal
      setIsRejectModalOpen(false)
      setSelectedProduct(null)
      setRejectionReason("")

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
      await api.delete(`/v1/admin/delete-product/${productId}`)

      // Find the product to determine which count to update
      const productToDelete = allProducts.find((p) => p.id === productId)

      // Update counts
      if (productToDelete) {
        const newCounts = { ...counts, all: counts.all - 1 }

        if (productToDelete.isProductApprove) {
          newCounts.approved = Math.max(0, counts.approved - 1)
        } else if (productToDelete.productStatus === "pending") {
          newCounts.pending = Math.max(0, counts.pending - 1)
        } else {
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
    setSearchTerm(e.target.value)
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchTerm("")
    setPagination({ ...pagination, currentPage: 1 }) // Reset page on tab change
    fetchProducts(tab) // Ensure fresh data when switching tabs
  }

  // View more info
  const handleViewMore = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  // Open approve modal
  const openApproveModal = (product: Product) => {
    setSelectedProduct(product)
    setApprovalData({
      domainRatings: product.domainRatings || 0,
      domainAuthority: product.domainAuthority || 0,
      monthlyTraffic: product.monthlyTraffic || 0,
    })
    setIsApproveModalOpen(true)
  }

  // Open reject modal
  const openRejectModal = (product: Product) => {
    setSelectedProduct(product)
    setRejectionReason("")
    setIsRejectModalOpen(true)
  }

  // Format currency
  const formatCurrency = (amount: string | null, currency: string) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(Number.parseFloat(amount))
  }

  // Get product status label
  const getProductStatusLabel = (product: Product): string => {
    if (product.isProductApprove) return "Approved"
    if (product.productStatus === "pending") return "Pending"
    return "Rejected"
  }

  // Get product status badge color
  const getProductStatusColor = (status: string): string => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-800"
      case "Pending":
        return "bg-amber-100 text-amber-800"
      case "Rejected":
        return "bg-rose-100 text-rose-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, currentPage: newPage })
  }

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setPagination({
      currentPage: 1, // Reset to first page
      itemsPerPage: newItemsPerPage,
      totalPages: Math.max(1, Math.ceil(filteredProducts.length / newItemsPerPage)),
    })
  }

  const { hasAnyPermission, hasPermission } = usePermissions()

  return (
    <div className="flex flex-col space-y-6">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Review and manage product listings</CardDescription>
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
        <CardContent className="px-3 overflow-x-auto h-auto">
          <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6 p-3 sm:p-6 bg-slate-200 lg:h-[50px] h-[auto] rounded-lg w-full grid grid-cols-2 gap-2 sm:gap-4 md:flex md:flex-row md:justify-between md:gap-1">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-3 sm:py-6 w-full text-xs sm:text-sm"
              >
                <div className="bg-amber-200 text-amber-700 p-1 sm:p-2 rounded-md">
                  <Inbox className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Pending</span>
                  <span className="text-xs font-normal text-muted-foreground">{counts.pending} requests</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-3 sm:py-6 w-full text-xs sm:text-sm"
              >
                <div className="bg-emerald-200 text-emerald-700 p-1 sm:p-2 rounded-md">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Approved</span>
                  <span className="text-xs font-normal text-muted-foreground">{counts.approved} requests</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-3 sm:py-6 w-full text-xs sm:text-sm"
              >
                <div className="bg-rose-200 text-rose-700 p-1 sm:p-2 rounded-md">
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Rejected</span>
                  <span className="text-xs font-normal text-muted-foreground">{counts.rejected} requests</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-3 sm:py-6 w-full text-xs sm:text-sm"
              >
                <div className="bg-blue-200 text-blue-700 p-1 sm:p-2 rounded-md">
                  <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
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
                <ProductTable
                  products={getPaginatedProducts()}
                  totalItems={filteredProducts.length}
                  onApprove={openApproveModal}
                  onReject={openRejectModal}
                  onDelete={handleDelete}
                  onViewMore={handleViewMore}
                  formatCurrency={formatCurrency}
                  activeTab={activeTab}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </TabsContent>

            <TabsContent value="approved">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ProductTable
                  products={getPaginatedProducts()}
                  totalItems={filteredProducts.length}
                  onApprove={openApproveModal}
                  onReject={openRejectModal}
                  onDelete={handleDelete}
                  onViewMore={handleViewMore}
                  formatCurrency={formatCurrency}
                  activeTab={activeTab}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ProductTable
                  products={getPaginatedProducts()}
                  totalItems={filteredProducts.length}
                  onApprove={openApproveModal}
                  onReject={openRejectModal}
                  onDelete={handleDelete}
                  onViewMore={handleViewMore}
                  formatCurrency={formatCurrency}
                  activeTab={activeTab}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </TabsContent>

            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ProductTable
                  products={getPaginatedProducts()}
                  totalItems={filteredProducts.length}
                  onApprove={openApproveModal}
                  onReject={openRejectModal}
                  onDelete={handleDelete}
                  onViewMore={handleViewMore}
                  formatCurrency={formatCurrency}
                  activeTab={activeTab}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-3xl bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold text-gray-800">Product Details</DialogTitle>
          {selectedProduct && (
            <>
              {/* Modal Header */}
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Complete information about {selectedProduct.siteName} product listing.
                  </p>
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
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        Visit Website <EyeIcon className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">3. Sample Link:</span>{" "}
                      <a
                        href={selectedProduct.sampleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        View Sample <EyeIcon className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">4. Price:</span>{" "}
                      {formatCurrency(selectedProduct.price, selectedProduct.currency)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">5. Adjusted Price:</span>{" "}
                      {formatCurrency(selectedProduct.adjustedPrice, selectedProduct.currency)}
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
                      <span className="font-medium text-gray-500">6. Language:</span> {selectedProduct.language}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">7. Niche:</span> {selectedProduct.niche}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">8. Country:</span> {selectedProduct.country}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">9. Category:</span>{" "}
                      {selectedProduct.category?.join(", ") || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">10. Status:</span>{" "}
                      <Badge
                        variant="outline"
                        className={
                          selectedProduct.isProductApprove
                            ? "bg-green-50 text-green-700"
                            : selectedProduct.productStatus === "pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-rose-50 text-rose-700"
                        }
                      >
                        {selectedProduct.isProductApprove
                          ? "Approved"
                          : selectedProduct.productStatus === "pending"
                            ? "Pending"
                            : "Rejected"}
                      </Badge>
                    </div>
                    {selectedProduct.rejectionReason && (
                      <div>
                        <span className="font-medium text-gray-500">11. Rejection Reason:</span>{" "}
                        {selectedProduct.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons - Show Accept & Reject ONLY if status is "pending" */}
              <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                {activeTab === "pending" && (
                  <>
                    {hasPermission("approve_product") && (
                      <Button
                        onClick={() => {
                          openApproveModal(selectedProduct)
                          setIsDialogOpen(false)
                        }}
                        className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg"
                      >
                        <Check className="mr-2 h-4 w-4" /> Approve
                      </Button>
                    )}

                    {hasPermission("reject_products") && (
                      <Button
                        onClick={() => {
                          openRejectModal(selectedProduct)
                          setIsDialogOpen(false)
                        }}
                        className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg"
                      >
                        <X className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    )}
                  </>
                )}

                {hasPermission("delete_product") && (
                  <Button
                    onClick={() => {
                      handleDelete(selectedProduct.id)
                      setIsDialogOpen(false)
                    }}
                    className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-lg"
                  >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </Button>
                )}
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

      {/* Approve Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-800">Approve Product</DialogTitle>
          {selectedProduct && (
            <>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Enter domain metrics for {selectedProduct.siteName}</p>
              </div>

              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="domainRatings">Domain Rating (0-100)</Label>
                  <Input
                    id="domainRatings"
                    type="text"
                    inputMode="numeric"
                    value={approvalData.domainRatings === 0 ? "" : approvalData.domainRatings}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "") {
                        setApprovalData({
                          ...approvalData,
                          domainRatings: 0,
                        })
                      } else {
                        const numValue = Number.parseInt(value, 10)
                        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                          setApprovalData({
                            ...approvalData,
                            domainRatings: numValue,
                          })
                        }
                      }
                    }}
                    placeholder="Enter a value from 0 to 100"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="domainAuthority">Domain Authority (0-100)</Label>
                  <Input
                    id="domainAuthority"
                    type="text"
                    inputMode="numeric"
                    value={approvalData.domainAuthority === 0 ? "" : approvalData.domainAuthority}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "") {
                        setApprovalData({
                          ...approvalData,
                          domainAuthority: 0,
                        })
                      } else {
                        const numValue = Number.parseInt(value, 10)
                        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                          setApprovalData({
                            ...approvalData,
                            domainAuthority: numValue,
                          })
                        }
                      }
                    }}
                    placeholder="Enter a value from 0 to 100"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="monthlyTraffic">Monthly Traffic</Label>
                  <Input
                    id="monthlyTraffic"
                    type="text"
                    inputMode="numeric"
                    value={approvalData.monthlyTraffic === 0 ? "" : approvalData.monthlyTraffic}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "") {
                        setApprovalData({
                          ...approvalData,
                          monthlyTraffic: 0,
                        })
                      } else {
                        const numValue = Number.parseInt(value, 10)
                        if (!isNaN(numValue) && numValue >= 0) {
                          setApprovalData({
                            ...approvalData,
                            monthlyTraffic: numValue,
                          })
                        }
                      }
                    }}
                    placeholder="Enter monthly traffic value"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleApprove(selectedProduct.id)}
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg"
                >
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg"
                  onClick={() => setIsApproveModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-800">Reject Product</DialogTitle>
          {selectedProduct && (
            <>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Provide a reason for rejecting {selectedProduct.siteName}</p>
              </div>

              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleReject(selectedProduct.id)}
                  className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg"
                  disabled={!rejectionReason.trim()}
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button
                  variant="outline"
                  className="text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg"
                  onClick={() => setIsRejectModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Update the ProductTable component to match the order management pagination design
function ProductTable({
  products,
  totalItems,
  onApprove,
  onReject,
  onDelete,
  onViewMore,
  formatCurrency,
  activeTab,
  pagination,
  onPageChange,
  onItemsPerPageChange,
}: {
  products: Product[]
  totalItems: number
  onApprove: (product: Product) => void
  onReject: (product: Product) => void
  onDelete: (id: string) => void
  onViewMore: (product: Product) => void
  formatCurrency: (amount: string | null, currency: string) => string
  activeTab: string
  pagination: { currentPage: number; itemsPerPage: number; totalPages: number }
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}) {
  const { hasAnyPermission, hasPermission } = usePermissions()
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table className="w-full ">
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead className="py-4 text-left">Site Name</TableHead>
              <TableHead className="py-4 text-left">Price</TableHead>
              <TableHead className="hidden lg:table-cell py-4 text-left">Language</TableHead>
              <TableHead className="py-4 text-left">Niche</TableHead>
              <TableHead className="hidden lg:table-cell py-4 text-left">Country</TableHead>
              <TableHead className="hidden lg:table-cell py-4 text-left">Currency</TableHead>
              <TableHead className="hidden xl:table-cell py-4 text-left">Category</TableHead>
              <TableHead className="hidden xl:table-cell py-4 text-left">Visit</TableHead>
              <TableHead className="hidden xl:table-cell py-4 text-left">Live Time</TableHead>
              <TableHead className="hidden xl:table-cell py-4 text-left">Status</TableHead>
              <TableHead className="py-4 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
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
                    <span className="font-medium">{formatCurrency(product.price, product.currency)}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-4">{product.language}</TableCell>
                  <TableCell className="py-4">{product.niche}</TableCell>
                  <TableCell className="hidden lg:table-cell py-4">{product.country}</TableCell>
                  <TableCell className="hidden lg:table-cell py-4">{product.currency}</TableCell>
                  <TableCell className="hidden xl:table-cell py-4">
                    <div className="flex flex-col space-y-2">
                      {product.category && product.category.length > 0 ? (
                        <>
                          {product.category.slice(0, 3).map((cat, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 mr-1"
                            >
                              {cat}
                            </Badge>
                          ))}
                          {product.category.length > 3 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-1 h-6 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                >
                                  +{product.category.length - 3} more
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {product.category.slice(3).map((cat, index) => (
                                  <DropdownMenuItem key={index}>{cat}</DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">No categories</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell py-4">
                    <a
                      href={product.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title={product.websiteUrl}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </a>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell py-4">{product.liveTime || "N/A"}</TableCell>
                  <TableCell className="hidden xl:table-cell py-4">
                    <Badge
                      variant="outline"
                      className={
                        product.isProductApprove
                          ? "bg-emerald-100 text-emerald-800"
                          : product.productStatus === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                      }
                    >
                      {product.isProductApprove
                        ? "Approved"
                        : product.productStatus === "pending"
                          ? "Pending"
                          : "Rejected"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex justify-end gap-2">
                      {activeTab === "pending" && (
                        <>
                          {hasPermission("approve_product") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onApprove(product)}
                              className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                          )}

                          {hasPermission("reject_products") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onReject(product)}
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          )}
                        </>
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
                            onClick={() => onViewMore(product)}
                            className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                          >
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {hasPermission("delete_product") && (
                            <DropdownMenuItem
                              onClick={() => onDelete(product.id)}
                              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
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

      {/* Pagination Controls - Updated to match order management design */}
      {pagination.totalPages > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
            {Math.min(pagination.currentPage * pagination.itemsPerPage, totalItems)} of {totalItems} products
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              value={pagination.itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={pagination.currentPage === 1}>
              <ChevronLeft className="h-3 w-3 mr-1" />
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Logic to show pages around current page
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Last
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

