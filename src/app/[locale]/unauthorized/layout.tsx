import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Unauthorized Access",
  description: "You don't have permission to access this page."
}

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
} 