"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home } from "lucide-react"

export default function ModeratorDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  
  // Determine active item based on the current path
  const getActiveItemFromPath = (path: string) => {
    if (path.includes("/moderator/dashboard")) return "dashboard"
    if (path.includes("/moderator/publishers")) return "publishers"
    if (path.includes("/moderator/websites")) return "websites"
    if (path.includes("/moderator/add-site")) return "website"
    if (path.includes("/moderator/orders")) return "orders"
    if (path.includes("/moderator/withdraw-requests")) return "withdrawRequests"
    return "dashboard" // Default to dashboard
  }
  
  const activeItem = getActiveItemFromPath(pathname)

  return (
    <SidebarProvider>
      <AppSidebar 
        role="moderator" 
        activeItem={activeItem}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 transition-[width,height] ease-linear bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1.5 text-slate-500 hover:text-slate-700" />
            <Separator orientation="vertical" className="mr-2 h-5 bg-slate-200" />
            <h1 className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">Moderator Dashboard</h1>
          </div>
        </header>
        <div className="p-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 