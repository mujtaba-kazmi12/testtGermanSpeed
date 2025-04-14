"use client"

import type React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaginationProps {
  currentPage: number
  totalPages: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function Pagination({ currentPage, totalPages, limit, onPageChange, onLimitChange }: PaginationProps) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Items per page</span>
        <Select value={limit.toString()} onValueChange={(value) => onLimitChange(Number.parseInt(value))}>
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
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export const PaginationContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="join">{children}</div>
}

export const PaginationItem = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export const PaginationLink = ({
  onClick,
  isActive,
  children,
}: { onClick: any; isActive: boolean; children: React.ReactNode }) => {
  return (
    <Button variant="outline" className={`join-item ${isActive ? "bg-blue-500 text-white" : ""}`} onClick={onClick}>
      {children}
    </Button>
  )
}

export const PaginationEllipsis = () => {
  return (
    <Button variant="outline" className="join-item">
      ...
    </Button>
  )
}

export const PaginationPrevious = ({ onClick, className }: { onClick: any; className?: string }) => {
  return (
    <Button variant="outline" className={`join-item`} onClick={onClick}>
      <ChevronLeft className="h-4 w-4 mr-1" />
      Previous
    </Button>
  )
}

export const PaginationNext = ({ onClick, className }: { onClick: any; className?: string }) => {
  return (
    <Button variant="outline" className={`join-item`} onClick={onClick}>
      Next
      <ChevronRight className="h-4 w-4 ml-1" />
    </Button>
  )
}

