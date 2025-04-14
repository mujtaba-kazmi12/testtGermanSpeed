import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProfileData {
  walletBalance: number
  currency: string
  walletAddress: string
  firstName: string
  lastName: string
  email: string
  // other fields omitted for brevity
}

interface FinancialOverviewProps {
  profileData: ProfileData | null
  isLoading: boolean
  error: string | null
}

export function FinancialOverview({ profileData, isLoading, error }: FinancialOverviewProps) {
  if (isLoading) {
    return (
      <Card className="bg-green-50 col-span-4 md:col-span-1 md:row-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Current Balance</CardTitle>
          <div className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-24 mb-1" />
          <Skeleton className="h-4 w-12" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-green-50 col-span-4 md:col-span-1 md:row-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Current Balance</CardTitle>
          <div className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-green-50 col-span-4 md:col-span-1 md:row-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-green-800">Current Balance</CardTitle>
        <div className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary">
          <CreditCard className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{profileData?.walletBalance}</div>
        <p className="text-xs text-muted-foreground">{profileData?.currency}</p>
      </CardContent>
    </Card>
  )
}

