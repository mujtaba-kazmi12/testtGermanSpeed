"use client"

import type { ReactNode } from "react"
import { CartProvider } from "@/context/CartContext"
import { UserProfileProvider } from "@/context/user-profile-context"
import { NotificationsProvider } from "@/context/notifications-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProfileProvider>
      <NotificationsProvider>
        <CartProvider>{children}</CartProvider>
      </NotificationsProvider>
    </UserProfileProvider>
  )
}

