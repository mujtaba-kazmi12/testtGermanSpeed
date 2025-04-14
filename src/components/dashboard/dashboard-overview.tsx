"use client"

import { useState, useEffect } from "react"
import {
  PackageCheck,
  PackageX,
  ShoppingBag,
  Users,
  UserCheck,
  ClockIcon as UserClock,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getAdminStats, getPublisherStats } from "@/lib/api"
import type { AdminStats, PublisherStats, DashboardStats } from "@/types/admin"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

// Sample chart data for initial render
const initialChartData = {
  productStats: Array(7)
    .fill(0)
    .map((_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      approvedProducts: 0,
      pendingProducts: 0,
    })),
  publisherStats: Array(7)
    .fill(0)
    .map((_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      approvedPublishers: 0,
      pendingPublishers: 0,
    })),
}

export default function DashboardOverview() {
  const router = useRouter()
  const [chartView, setChartView] = useState("publishers")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        const token = Cookies.get("token")
        const role = Cookies.get("role")
        setUserRole(role || null)

        if (!token) {
          // Redirect to login if not authenticated
          router.push("/login")
          return
        }

        // Check if user has appropriate role
        if (role !== "superadmin" && role !== "moderator" && role !== "admin" && role !== "publisher") {
          setError("You don't have permission to access this dashboard")
          return
        }

        setLoading(true)

        let data
        if (role === "publisher") {
          // Fetch publisher-specific stats for publisher role
          data = await getPublisherStats()
        } else {
          // Fetch admin stats for superadmin, moderator, and admin roles
          data = await getAdminStats()
        }

        if (data) {
          setStats(data)
          setError(null)
        } else {
          setError("Failed to fetch dashboard data. Please try again later.")
        }
      } catch (err) {
        setError("An error occurred while fetching dashboard data.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Type guard to check if stats is AdminStats
  const isAdminStats = (stats: DashboardStats | null): stats is AdminStats => {
    return stats !== null && "totalPublishers" in stats
  }

  // Type guard to check if stats is PublisherStats
  const isPublisherStats = (stats: DashboardStats | null): stats is PublisherStats => {
    return stats !== null && "acceptedOrders" in stats
  }

  // Calculate percentages for admin stats
  const getAdminPercentages = () => {
    if (!isAdminStats(stats))
      return {
        approvedPublishersPercentage: 0,
        pendingPublishersPercentage: 0,
        approvedProductsPercentage: 0,
        pendingProductsPercentage: 0,
      }

    return {
      approvedPublishersPercentage: stats.totalPublishers
        ? Math.round((stats.approvedPublishers / stats.totalPublishers) * 100)
        : 0,
      pendingPublishersPercentage: stats.totalPublishers
        ? Math.round((stats.pendingPublishers / stats.totalPublishers) * 100)
        : 0,
      approvedProductsPercentage: stats.totalProducts
        ? Math.round((stats.approvedProducts / stats.totalProducts) * 100)
        : 0,
      pendingProductsPercentage: stats.totalProducts
        ? Math.round((stats.pendingProducts / stats.totalProducts) * 100)
        : 0,
    }
  }

  // Calculate percentages for publisher stats
  const getPublisherPercentages = () => {
    if (!isPublisherStats(stats))
      return {
        approvedProductsPercentage: 0,
        pendingProductsPercentage: 0,
        acceptedOrdersPercentage: 0,
        pendingOrdersPercentage: 0,
      }

    return {
      approvedProductsPercentage: stats.totalProducts
        ? Math.round((stats.approvedProducts / stats.totalProducts) * 100)
        : 0,
      pendingProductsPercentage: stats.totalProducts
        ? Math.round((stats.pendingProducts / stats.totalProducts) * 100)
        : 0,
      acceptedOrdersPercentage: stats.totalOrders ? Math.round((stats.acceptedOrders / stats.totalOrders) * 100) : 0,
      pendingOrdersPercentage: stats.totalOrders ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0,
    }
  }

  const adminPercentages = getAdminPercentages()
  const publisherPercentages = getPublisherPercentages()

  // Format date for display
  const formatDate = (date: string) => {
    // If date is already a month name (Jan, Feb, etc.), return it directly
    if (date.length <= 3) return date

    // Otherwise, format the full date
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Create chart data from the stats
  const createChartData = () => {
    if (!stats) return initialChartData

    if (isPublisherStats(stats) && stats.monthlyStats) {
      // For publisher role (publisher stats)
      // Convert month numbers to month names
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      // Get the monthly stats for products
      const productStats = stats.monthlyStats.map((monthData) => ({
        date: monthNames[monthData.month - 1],
        approvedProducts: monthData.approvedProducts,
        pendingProducts: monthData.pendingProducts,
        totalProducts: monthData.totalProducts,
      }))

      // Get the monthly stats for orders
      const orderStats = stats.monthlyStats.map((monthData) => ({
        date: monthNames[monthData.month - 1],
        acceptedOrders: monthData.acceptedOrders,
        pendingOrders: monthData.pendingOrders,
        totalOrders: monthData.totalOrders,
      }))

      return { productStats, publisherStats: orderStats }
    } else if (isAdminStats(stats) && stats.monthlyStats) {
      // For admin roles
      // Convert month numbers to month names
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      // Get the monthly stats for products
      const productStats = stats.monthlyStats.map((monthData) => ({
        date: monthNames[monthData.month - 1],
        approvedProducts: monthData.approvedProducts,
        pendingProducts: monthData.pendingProducts,
        rejectedProducts: monthData.rejectedProducts || 0,
      }))

      // Get the monthly stats for publishers
      const publisherStats = stats.monthlyStats.map((monthData) => ({
        date: monthNames[monthData.month - 1],
        approvedPublishers: monthData.approvedPublishers,
        pendingPublishers: monthData.pendingPublishers,
      }))

      return { productStats, publisherStats }
    }

    return initialChartData
  }

  // Get chart data
  const chartData = stats ? createChartData() : initialChartData
  const productStats = chartData.productStats
  const publisherStats = chartData.publisherStats

  // Create a simple chart using divs
  const renderChart = (data: any[], keys: string[], colors: string[]) => {
    if (!data.length) return null

    // Find the maximum value for scaling
    const maxValue = Math.max(...data.flatMap((item) => keys.map((key) => item[key] || 0)))
    // Use a minimum value of 5 to avoid empty charts when all values are 0
    const chartMaxValue = Math.max(maxValue, 5)

    return (
      <div className="h-[300px] w-full flex items-end space-x-2 mt-8 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground pr-2">
          <span>{chartMaxValue}</span>
          <span>{Math.round(chartMaxValue / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart bars */}
        <div className="ml-8 flex-1 flex items-end space-x-4 h-full">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex space-x-1 h-[250px] items-end">
                {keys.map((key, keyIndex) => {
                  const value = item[key] || 0
                  const height = chartMaxValue ? (value / chartMaxValue) * 100 : 0

                  return (
                    <div
                      key={key}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${height}%`,
                        backgroundColor: colors[keyIndex],
                        transition: "height 0.3s ease-in-out",
                      }}
                      title={`${key}: ${value}`}
                    />
                  )
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-2">{formatDate(item.date)}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-8 p-6 min-h-screen bg-white dark:bg-slate-950">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden border rounded-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-[400px]" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 min-h-screen bg-white dark:bg-slate-950">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 min-h-screen bg-white dark:bg-slate-950">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {userRole === "publisher" && isPublisherStats(stats) ? (
          <>
            {/* Approved Products Card */}
            <Card className="overflow-hidden border rounded-lg bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Approved Products</h3>
                  <div className="text-green-600 dark:text-green-400">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold">{stats.approvedProducts || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {publisherPercentages.approvedProductsPercentage}% of total products
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pending Products Card */}
            <Card className="overflow-hidden border rounded-lg bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Pending Products</h3>
                  <div className="text-red-600 dark:text-red-400">
                    <PackageX className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold">{stats.pendingProducts || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {publisherPercentages.pendingProductsPercentage}% of total products
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Accepted Orders Card */}
            <Card className="overflow-hidden border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Accepted Orders</h3>
                  <div className="text-blue-600 dark:text-blue-400">
                    <UserCheck className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold">{stats.acceptedOrders || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {publisherPercentages.acceptedOrdersPercentage}% of total orders
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pending Orders Card */}
            <Card className="overflow-hidden border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending Orders</h3>
                  <div className="text-amber-600 dark:text-amber-400">
                    <UserClock className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold">{stats.pendingOrders || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {publisherPercentages.pendingOrdersPercentage}% of total orders
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          isAdminStats(stats) && (
            <>
              {/* Approved Publishers Card */}
              <Card className="overflow-hidden border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Approved Publishers</h3>
                    <div className="text-blue-600 dark:text-blue-400">
                      <UserCheck className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold">{stats.approvedPublishers || 0}</p>
                    <p className="text-sm text-muted-foreground">
                      {adminPercentages.approvedPublishersPercentage}% of total publishers
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Publishers Card */}
              <Card className="overflow-hidden border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending Publishers</h3>
                    <div className="text-amber-600 dark:text-amber-400">
                      <UserClock className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold">{stats.pendingPublishers || 0}</p>
                    <p className="text-sm text-muted-foreground">
                      {adminPercentages.pendingPublishersPercentage}% of total publishers
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Approved Products Card */}
              <Card className="overflow-hidden border rounded-lg bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Approved Products</h3>
                    <div className="text-green-600 dark:text-green-400">
                      <PackageCheck className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold">{stats.approvedProducts || 0}</p>
                    <p className="text-sm text-muted-foreground">
                      {adminPercentages.approvedProductsPercentage}% of total products
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Products Card */}
              <Card className="overflow-hidden border rounded-lg bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Pending Products</h3>
                    <div className="text-red-600 dark:text-red-400">
                      <PackageX className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold">{stats.pendingProducts || 0}</p>
                    <p className="text-sm text-muted-foreground">
                      {adminPercentages.pendingProductsPercentage}% of total products
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )
        )}
      </div>

      <Card className="border rounded-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="publishers" value={chartView} onValueChange={setChartView} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Analytics Overview</h2>
              <TabsList className="grid w-[400px] grid-cols-2 h-10 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <TabsTrigger 
                  value="publishers"
                  className="text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {userRole === "publisher" ? "Orders" : "Publishers"}
                </TabsTrigger>
                <TabsTrigger 
                  value="products"
                  className="text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Products
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="publishers" className="mt-0 border-0 p-0">
              <div className="h-[400px] w-full">
                {/* Chart legend */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  {userRole === "publisher" ? (
                    <>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm">Accepted Orders</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                        <span className="text-sm">Pending Orders</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm">Approved Publishers</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                        <span className="text-sm">Pending Publishers</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Dynamic chart */}
                {userRole === "publisher"
                  ? renderChart(publisherStats, ["acceptedOrders", "pendingOrders"], ["#3b82f6", "#f59e0b"])
                  : renderChart(publisherStats, ["approvedPublishers", "pendingPublishers"], ["#3b82f6", "#f59e0b"])}
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-0 border-0 p-0">
              <div className="h-[400px] w-full">
                {/* Chart legend */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Approved Products</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">Pending Products</span>
                  </div>
                </div>
                {/* Dynamic chart */}
                {renderChart(productStats, ["approvedProducts", "pendingProducts"], ["#10b981", "#ef4444"])}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

