"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, ChevronsUpDown, LogOut } from "lucide-react"
import Cookies from "js-cookie"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useNotifications } from "@/context/notifications-context"
import { useUserProfile } from "@/context/user-profile-context"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function NavUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { openModal, pagination } = useNotifications()
  const { userProfile, isLoading, fetchUserProfile } = useUserProfile()

  // Get user role from cookies
  const userRole = Cookies.get("role") || ""
  const isPublisher = userRole === "publisher"

  // Fetch user profile on component mount and after login
useEffect(() => {
  const token = Cookies.get("token");
  if (token) {
    fetchUserProfile(); 
  }
}, [router]);


  // Get initials for avatar fallback
  const getInitials = () => {
    if (!userProfile) return "U"

    const firstInitial = userProfile.firstName ? userProfile.firstName.charAt(0) : ""
    const lastInitial = userProfile.lastName ? userProfile.lastName.charAt(0) : ""

    return (firstInitial + lastInitial).toUpperCase() || "U"
  }

  // Get full name
  const getFullName = () => {
    if (!userProfile) return ""
    return `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim()
  }

  const handleLogout = () => {
    // Remove all auth-related cookies
    Cookies.remove("token")
    Cookies.remove("role")
    Cookies.remove("userId")
    Cookies.remove("permissions")
    // Redirect to home page
    router.push("/")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-slate-100 transition-all"
            >
              <Avatar className="h-8 w-8 rounded-lg border-2 border-slate-200">
                {/* We don't have avatar URL in the API response, so using fallback */}
                <AvatarFallback className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold">{isLoading ? "..." : getInitials()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </>
                ) : (
                  <>
                    <span className="truncate font-medium text-slate-800">{getFullName()}</span>
                    <span className="truncate text-xs text-slate-500">{userProfile?.email}</span>
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-500" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg shadow-lg border-slate-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-slate-800">{getFullName()}</span>
                  <span className="truncate text-xs text-slate-500">{userProfile?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup></DropdownMenuGroup>

            {/* Only show notifications for publisher role */}
            {isPublisher && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={openModal} className="relative hover:bg-slate-50">
                    <Bell className="mr-2 h-4 w-4 text-violet-500" />
                    Notifications
                    {pagination.total > 0 && (
                      <Badge
                        className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-0"
                      >
                        {pagination.total}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="hover:bg-slate-50">
              <LogOut className="mr-2 h-4 w-4 text-violet-500" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

