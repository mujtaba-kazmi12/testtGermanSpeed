"use client"

import { useState } from "react"
import { useNotifications } from "@/context/notifications-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { axiosInstance } from "@/lib/api"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"

export function NotificationModal() {
  const {
    isModalOpen,
    closeModal,
    pendingProducts,
    fetchPendingProducts,
    handleSubmissionSuccess,
    pagination,
    isLoading,
  } = useNotifications()
  const [submissionLinks, setSubmissionLinks] = useState<Record<string, string>>({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const handleInputChange = (id: string, value: string) => {
    setSubmissionLinks((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const submitPostingLink = async (id: string, link: string) => {
    const token = Cookies.get("token")
    if (!token) {
      throw new Error("Authentication token is missing")
    }

    return axiosInstance.post(
      `/v1/submit-post/${id}`,
      {
        id: id,
        submittedPostUrl: link,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }

  const handleSubmit = async (id: string) => {
    const link = submissionLinks[id]
    if (!link) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmittingId(id)
      await submitPostingLink(id, link)

      toast({
        title: "Success",
        description: "Posting link submitted successfully",
      })

      // Clear the input field after successful submission
      setSubmissionLinks((prev) => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })

      // Call both refresh functions to update the UI
      fetchPendingProducts(currentPage, pagination.limit)
      handleSubmissionSuccess()
    } catch (error) {
      console.error("Error submitting posting link:", error)
      toast({
        title: "Error",
        description: "Failed to submit posting link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingId(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.limit)) {
      return
    }
    setCurrentPage(newPage)
    fetchPendingProducts(newPage, pagination.limit)
  }

  // Skeleton loading rows
  const SkeletonRows = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <div className="flex justify-center">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-9 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-9 w-16" />
          </TableCell>
        </TableRow>
      ))
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Pending Products</DialogTitle>
          <p className="text-md font-semibold mt-2 text-red-500">
            Copy this link, paste it in your website, and then submit your post link here.
          </p>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>Posting Link</TableHead>
                <TableHead>Submit Post URL</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows />
              ) : pendingProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="py-6 text-center text-muted-foreground">No pending products to display</div>
                  </TableCell>
                </TableRow>
              ) : (
                pendingProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.siteName}</TableCell>
                    <TableCell>
                      <a
                        href={product.postingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 justify-center"
                        title={product.postingLink}
                      >
                        <ExternalLink className="ml-6 h-10 w-5" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Enter postURL"
                        value={submissionLinks[product.id] || ""}
                        onChange={(e) => handleInputChange(product.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSubmit(product.id)}
                        disabled={!submissionLinks[product.id] || submittingId === product.id}
                      >
                        {submittingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {pagination.total > 0 && (
          <DialogFooter className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pagination.limit + 1}-
              {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {Math.ceil(pagination.total / pagination.limit)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(pagination.total / pagination.limit) || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

