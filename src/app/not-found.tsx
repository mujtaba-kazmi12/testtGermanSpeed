"use client"

import React, { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// Component that will use useSearchParams
function NotFoundContent() {
  const router = useRouter()
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
      <h1 className="text-6xl font-bold text-center mb-6">
        <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          404
        </span>
      </h1>
      <h2 className="text-2xl font-medium text-center mb-6">Page Not Found</h2>
      <p className="text-center text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="border-2"
        >
          Go Back
        </Button>
        <Button
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
        >
          Return Home
        </Button>
      </div>
    </div>
  )
}

// Wrap with Suspense to prevent the error with useSearchParams
export default function NotFound() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[70vh]">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  )
} 