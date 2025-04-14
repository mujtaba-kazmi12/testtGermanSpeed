"use client"

import { useState, useEffect } from "react"
import { OrderData } from "@/app/[locale]/Services/OrderService"
import type { Order } from "@/types/checkout"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ChevronDown, Search, Filter, Calendar, FileText, ExternalLink, Home } from "lucide-react"

export default function OrdersPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All Orders")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10 // Changed to 10 items per page
  const orderStatusOptions = [
    { value: "All Orders", label: "All Orders" },
    { value: "Pending", label: "Pending" },
    { value: "Completed", label: "Completed" },
    { value: "Canceled", label: "Canceled" },
    { value: "In Progress", label: "In Progress" },
    { value: "Rejected", label: "Rejected" },
    { value: "Submitted", label: "Submitted" },
  ]

  // Fetch Orders
  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        // Call OrderData with the correct parameters
        const response = await OrderData(setError, currentPage, pageSize)
        console.log("API Response:", response)

        if (response && response.data) {
          // Set orders from the items array
          if (Array.isArray(response.data.items)) {
            setOrders(response.data.items)
            // Calculate total pages based on the total count and page size
            const total = Number.parseInt(response.data.total) || 0
            setTotalItems(total)
            setTotalPages(Math.ceil(total / pageSize))
            console.log(`Total items: ${total}, Page size: ${pageSize}, Total pages: ${Math.ceil(total / pageSize)}`)
          } else if (Array.isArray(response.data)) {
            setOrders(response.data)
            setTotalItems(response.data.length)
            setTotalPages(Math.ceil(response.data.length / pageSize))
          } else {
            console.error("Unexpected data format:", response.data)
            setError("Unexpected data format received")
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError("Failed to fetch Orders")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentPage, pageSize])

  // Filter Orders Function
  useEffect(() => {
    let filtered = [...orders]

    if (statusFilter !== "All Orders") {
      filtered = filtered.filter((order) => order.orderStatus?.toLowerCase() === statusFilter.toLowerCase())
    }

    if (searchText.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          String(order.orderNumber || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          String(order.backupEmail || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          String(order.totalAmount || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()),
      )
    }

    setFilteredOrders(filtered)
  }, [orders, searchText, statusFilter])

  // Pagination Handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-200"
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200"
      case "in progress":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "submitted":
        return "bg-violet-100 text-violet-800 border border-violet-200"
      case "accepted":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200"
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200"
    }
  }

  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="w-full mx-auto my-6 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-6">
        <h1 className="text-xl font-semibold">My Orders</h1>
        <p className="text-white/90 mt-1">Manage and track all your orders in one place</p>
      </div>

      {/* Filter & Search Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-slate-50 border-b border-slate-200">
        {/* Filter Dropdown */}
        <div className="relative w-full sm:w-64">
          <div className="flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-slate-500" />
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex justify-between items-center w-full p-3 pl-10 border rounded-lg bg-white cursor-pointer hover:border-violet-300 transition-all"
            >
              <span className="text-slate-700">{statusFilter || "Select Order Status"}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          {isDropdownOpen && (
            <div className="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              {orderStatusOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value)
                    setIsDropdownOpen(false)
                    toast.info(`Filtered by: ${option.label}`, {
                      duration: 2000,
                    })
                  }}
                  className="p-3 hover:bg-violet-50 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full p-3 pl-12 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <div className="overflow-x-auto p-6">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-slate-100 text-left text-slate-700 rounded-lg">
                <th className="p-3 font-semibold rounded-tl-lg">Order No</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Website URL</th>
                <th className="p-3 font-semibold">AnchorLink URL</th>
                <th className="p-3 font-semibold">AnchorLink</th>
                <th className="p-3 font-semibold">File Link</th>
                <th className="p-3 font-semibold">Payment (€)</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold rounded-tr-lg">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3 font-medium">{order.orderNumber}</td>
                    <td className="p-3">{order.backupEmail}</td>
                    <td className="p-3">
                      {order.products && order.products.length > 0 && order.products[0].websiteURL ? (
                        <a
                          href={order.products[0].websiteURL}
                          className="text-violet-600 hover:text-fuchsia-600 transition-colors flex items-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Home className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-slate-400">
                          <Home className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {order.anchorLink ? (
                        <a
                          href={order.anchorLink}
                          className="text-violet-600 hover:text-fuchsia-600 transition-colors flex items-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-slate-400">
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="p-3">{order.anchor ?? "Null"}</td>
                    <td className="p-3">
                      <a
                        href={order.file || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:text-fuchsia-600 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    </td>
                    <td className="p-3 font-medium">€{order.totalAmount}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500">
                    No orders found. Try changing your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 px-2">
            <div className="text-sm text-slate-600">
              Showing {filteredOrders.length > 0 ? startItem : 0} to {filteredOrders.length > 0 ? endItem : 0} of{" "}
              {totalItems} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-700 hover:to-fuchsia-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
