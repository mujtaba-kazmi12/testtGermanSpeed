"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { NotificationIcon } from "@/components/dashboard/notifications/notification-icon"
import { NotificationModal } from "@/components/dashboard/notifications/notifications-modal"
import Link from "next/link"
import { Home } from "lucide-react"

export default function PublisherDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  
  // Determine active item based on the current path
  const getActiveItemFromPath = (path: string) => {
    if (path.includes("/publisher/dashboard")) return "dashboard"
    if (path.includes("/publisher/products/create")) return "create-product"
    if (path.includes("/publisher/products")) return "all-products"
    if (path.includes("/publisher/orders")) return "Orders"
    if (path.includes("/publisher/withdraw")) return "withdraw"
    if (path.includes("/publisher/profile")) return "profile"
    return "dashboard" // Default to dashboard
  }
  
  const activeItem = getActiveItemFromPath(pathname)

  return (
    <SidebarProvider>
      <AppSidebar 
        role="publisher" 
        activeItem={activeItem}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 transition-[width,height] ease-linear bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1.5 text-slate-500 hover:text-slate-700" />
            <Separator orientation="vertical" className="mr-2 h-5 bg-slate-200" />
            <h1 className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">Publisher Dashboard</h1>
          </div>
          <div>
            <NotificationIcon />
          </div>
        </header>
        <div className="p-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </SidebarInset>

      {/* Add the notification modal here */}
      <NotificationModal />
    </SidebarProvider>
  )
} 