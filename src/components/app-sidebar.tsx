"use client"

import type * as React from "react"
import {
  AudioWaveform,
  Command,
  MessageSquare,
  Settings2,
  Users,
  ShoppingCart,
  LayoutDashboard,
  FileText,
  PlusIcon,
  Package,
  BarChart,
  Upload,
  ListChecks,
  FileCheck,
  HelpCircle,
  Building2,
  ShieldCheck,
  Banknote,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar"
import type { UserRole } from "@/types/auth"
import { cn } from "@/lib/utils"

// Modern company header component with gradient styling
function CompanyHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div className={cn("py-3", isCollapsed ? "px-0 flex justify-center items-center" : "px-3")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-slate-200/30",
          isCollapsed ? "p-1.5 w-9 h-9 flex items-center justify-center" : "p-3",
        )}
      >
        {/* Decorative pattern - only show when expanded */}
        {!isCollapsed && (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-fuchsia-50 opacity-50"></div>
        )}

        <div className={cn("relative flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          {/* Logo container */}
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
              isCollapsed ? "h-6 w-6" : "h-9 w-9",
            )}
          >
            <MessageSquare className={isCollapsed ? "h-3.5 w-3.5" : "h-5 w-5"} />
          </div>

          {/* Only show text when expanded */}
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">GermanGuestPost</span>
              <span className="text-xs text-slate-500">Content Marketplace</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Teams data (kept separate from user data)
const teamsData = [
  {
    name: "Acme Inc",
    logo: MessageSquare,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: Command,
    plan: "Free",
  },
]

// Get data based on role
const getDataByRole = (role?: UserRole) => {
  switch (role) {
    case "superadmin":
      return adminNavData
    case "moderator":
      return moderatorNavData
    case "publisher":
      return publisherNavData
    case "user":
      return userNavData
    default:
      return adminNavData // Default to admin if no role specified
  }
}

export function AppSidebar({
  role,
  activeItem,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  role?: UserRole
  activeItem?: string
}) {
  const data = getDataByRole(role)

  // Customize nav data with active states and URLs
  const customizedNavData = {
    ...data,
    navMain: data.navMain.map((item) => {
      // Check if any of this item's subitems is active
      // @ts-ignore - Item may have items property
      const hasActiveSubItem = item.items?.some((subItem) => subItem.id === activeItem)

      return {
        ...item,
        // Item is active if it's directly selected or has an active subitem
        isActive: activeItem === item.id || hasActiveSubItem,
        // @ts-ignore - Item may have items property
        items: item.items?.map((subItem) => ({
          ...subItem,
          isActive: activeItem === subItem.id,
        })),
      }
    }),
  }

  return (
    <Sidebar collapsible="icon" className="sidebar-custom" {...props}>
      <SidebarHeader>
        <CompanyHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={customizedNavData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

// Admin navigation data
const adminNavData = {
  teams: teamsData,
  navMain: [
    {
      id: "dashboard",
      title: "Analytics",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "publishers",
      title: "Manage Publisher",
      url: "/admin/publishers",
      icon: Users,
    },
    {
      id: "websites",
      title: "Website Management",
      url: "/admin/websites",
      icon: FileText,
    },
    {
      id: "orders",
      title: "Order Management",
      url: "/admin/orders",
      icon: BarChart,
    },
    {
      id: "moderator",
      title: "Moderator Management",
      url: "/admin/moderator",
      icon: ShieldCheck,
    },
    {
      id: "withdrawRequests",
      title: "Withdraw Requests",
      url: "/admin/withdraw-requests",
      icon: Banknote,
    }
  ],
}

// Moderator navigation data
const moderatorNavData = {
  teams: teamsData,
  navMain: [
    {
      id: "dashboard",
      title: "Overview",
      url: "/moderator/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "publishers",
      title: "Manage Publisher",
      url: "/moderator/publishers",
      icon: Users,
    },
    {
      id: "websites",
      title: "Add Website",
      url: "/moderator/add-site",
      icon: PlusIcon,
    },
    {
      id: "websites",
      title: "Website Management",
      url: "/moderator/websites",
      icon: FileText,
    },
    {
      id: "orders",
      title: "Order Management",
      url: "/moderator/orders",
      icon: BarChart,
    },
    {
      id: "withdrawRequests",
      title: "Withdraw Requests",
      url: "/moderator/withdraw-requests",
      icon: Banknote,
    }
  ],
}

// Publisher navigation data
const publisherNavData = {
  teams: teamsData,
  navMain: [
    {
      id: "dashboard",
      title: "Dashboard",
      url: "/publisher/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "products",
      title: "My Products",
      url: "/publisher/products",
      icon: Package,
      items: [
        {
          id: "create-product",
          title: "Create product",
          url: "/publisher/products/create",
        },
        {
          id: "all-products",
          title: "All Products",
          url: "/publisher/products",
        },
      ],
    },
    {
      id: "Orders",
      title: "Orders",
      url: "/publisher/orders",
      icon: Upload,
    },
    {
      id: "withdraw",
      title: "Widthdrawl",
      url: "/publisher/withdraw",
      icon: ShoppingCart,
    },
    {
      id: "profile",
      title: "Profile",
      url: "/publisher/profile",
      icon: Users,
    },
  ],
}

// User navigation data
const userNavData = {
  teams: teamsData,
  navMain: [
    {
      id: "orders",
      title: "Orders",
      url: "/user/orders",
      icon: ShoppingCart,
    },
    {
      id: "invoices",
      title: "Invoices",
      url: "/user/invoices",
      icon: FileText,
    },
    {
      id: "profile",
      title: "Profile",
      url: "/user/profile",
      icon: Users,
    },
  ],
}

