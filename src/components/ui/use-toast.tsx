"use client"

// This is a simplified version of the toast hook for shadcn/ui
// You can replace this with your actual toast implementation

import { useState } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type Toast = ToastProps & {
  id: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...props, id }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // For this simplified version, we'll just log to console
    console.log(`Toast: ${props.title} - ${props.description}`)

    // Auto dismiss after duration
    if (props.duration !== Number.POSITIVE_INFINITY) {
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
      }, props.duration || 3000)
    }

    return id
  }

  const dismiss = (toastId?: string) => {
    setToasts((prevToasts) => (toastId ? prevToasts.filter((t) => t.id !== toastId) : []))
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}

