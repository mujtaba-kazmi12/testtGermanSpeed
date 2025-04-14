"use client"

import { useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/context/notifications-context"

export function NotificationIcon() {
  const { pagination, isLoading, openModal, fetchPendingProducts } = useNotifications()

  useEffect(() => {
    fetchPendingProducts()

    // Set up polling every 1 minute to check for new pending products
    const intervalId = setInterval(fetchPendingProducts, 1 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [fetchPendingProducts])

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative hover:bg-slate-100 text-slate-500 hover:text-violet-600" 
        onClick={openModal} 
        disabled={isLoading}
      >
        <Bell className="h-5 w-5" />
        {pagination.total > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-0"
          >
            {pagination.total}
          </Badge>
        )}
      </Button>
    </div>
  )
}

