"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <div className="flex space-x-4">
            <Button 
              variant="outline"
              onClick={() => router.push("/")}
              className="px-4 py-2"
            >
              Return to Home
            </Button>
            <Button 
              onClick={() => router.push("/sign-in")}
              className="px-4 py-2"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 