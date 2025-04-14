"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Search, Download, ArrowLeft, ArrowRight, Filter, ChevronDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getInvoices } from "@/app/[locale]/Services/InvoicesService"
import jsPDF from "jspdf"
export default function InvoicesPage() {
  const [searchText, setSearchText] = useState("")
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const itemsPerPage = 10

  const statusOptions = [
    { value: "All", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
  ]

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true)

      try {
        const response = await getInvoices(setError, currentPage, itemsPerPage, searchText)
        if (response) {
          setOrders(response.items || [])
          const totalItems = response?.total ?? 0
          const calculatedPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
          setTotalPages(calculatedPages)
        }
      } catch (error) {
        console.error("Error fetching invoices:", error)
        toast.error("Failed to load invoices", {
          description: "Please try again later",
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [currentPage, searchText])

  // Filter invoices by status
  const filteredInvoices =
    statusFilter === "All" ? orders : orders.filter((order) => order.orderInvoice === statusFilter)

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
      toast.info(`Navigated to page ${currentPage - 1}`, {
        duration: 2000,
      })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
      toast.info(`Navigated to page ${currentPage + 1}`, {
        duration: 2000,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-300"
      case "completed":
        return "bg-green-100 text-green-800 border border-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-300"
      default:
        return "bg-slate-100 text-slate-800 border border-slate-300"
    }
  }

  const generateInvoicePDF = (invoice: any) => {
    // Create a new PDF document
    const doc = new jsPDF()

    // Add company logo/header
    doc.setFillColor(105, 105, 105)
    doc.rect(0, 0, 210, 40, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text("INVOICE", 105, 20, { align: "center" })

    // Reset text color for the rest of the document
    doc.setTextColor(0, 0, 0)

    // Add invoice details
    doc.setFontSize(12)
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 50)
    doc.text(`Order Number: ${invoice.orderNumber}`, 20, 60)
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 70)

    // Add customer details
    doc.setFontSize(14)
    doc.text("Customer Details:", 20, 90)
    doc.setFontSize(12)
    doc.text(`Name: ${invoice.user.firstName} ${invoice.user.lastName}`, 20, 100)
    doc.text(`Email: ${invoice.user.email}`, 20, 110)

    // Add invoice items
    doc.setFontSize(14)
    doc.text("Invoice Summary:", 20, 130)

    // Add table headers
    doc.setFillColor(240, 240, 240)
    doc.rect(20, 140, 170, 10, "F")
    doc.setFontSize(12)
    doc.text("Description", 25, 147)
    doc.text("Amount", 150, 147)

    // Add invoice amount
    doc.text("Total Amount:", 25, 167)
    doc.text(`${invoice.amount} ${invoice.currency}`, 150, 167)

    // Add status
    doc.text("Status:", 25, 177)
    doc.text(invoice.orderInvoice, 150, 177)

    // Add footer
    doc.setFontSize(10)
    doc.text("This is an automatically generated invoice.", 105, 250, { align: "center" })

    // Save the PDF with the invoice number as filename
    doc.save(`${invoice.invoiceNumber}.pdf`)
  }

  return (
    <div className="w-full mx-auto my-6 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-6">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <p className="text-white/80 mt-1">View and manage all your invoice records</p>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-slate-50 border-b">
        {/* Filter Dropdown */}
        <div className="relative w-full sm:w-64">
          <div className="flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-slate-500" />
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex justify-between items-center w-full p-3 pl-10 border border-slate-200 rounded-lg bg-white cursor-pointer hover:border-violet-500 transition-all"
            >
              <span className="text-slate-700">
                {statusOptions.find((option) => option.value === statusFilter)?.label || "All Statuses"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          {isDropdownOpen && (
            <div className="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              {statusOptions.map((option) => (
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
            placeholder={"Search invoices..."}
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="text-left text-slate-700 border-b">
                  <th className="p-3">Invoices Order ID</th>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Amount (€)</th>
                  <th className="p-3">Currency</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td colSpan={5} className="p-3 border border-slate-200">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto p-6">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-slate-100 text-left text-slate-700 rounded-lg">
                <th className="p-3 font-semibold rounded-tl-lg">Invoices Order ID</th>
                <th className="p-3 font-semibold">Invoice Number</th>
                <th className="p-3 font-semibold">Amount (€)</th>
                <th className="p-3 font-semibold">Currency</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold rounded-tr-lg">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((order) => (
                  <tr key={order.id} className="border-b text-slate-800 hover:bg-violet-50 transition-colors">
                    <td className="p-3 font-medium">{order.orderNumber}</td>
                    <td className="p-3">{order.invoiceNumber}</td>
                    <td className="p-3 font-medium">€{order.amount}</td>
                    <td className="p-3">{order.currency}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(
                          order.orderInvoice
                        )}`}
                      >
                        {order.orderInvoice.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => generateInvoicePDF(order)}
                        title="Download Invoice"
                        className="inline-flex items-center justify-center p-2 text-violet-600 hover:text-violet-800 hover:bg-violet-100 rounded-full transition-colors"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No invoices found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-slate-500">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  currentPage === 1
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  currentPage === totalPages
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                }`}
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

