import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface InvoiceStatusProps {
  type: "pending" | "approved" | "rejected"
  count: number
  isLoading: boolean
}

export function InvoiceStatus({ type, count, isLoading }: InvoiceStatusProps) {
  const getIcon = () => {
    switch (type) {
      case "pending":
        return <Clock className="h-6 w-6" />
      case "approved":
        return <CheckCircle className="h-6 w-6" />
      case "rejected":
        return <XCircle className="h-6 w-6" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case "pending":
        return "Pending Invoices"
      case "approved":
        return "Approved Invoices"
      case "rejected":
        return "Rejected Invoices"
    }
  }

  const getColor = () => {
    switch (type) {
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{getTitle()}</CardTitle>
        <div className={`h-10 w-10 rounded-full p-2 ${getColor()}`}>{getIcon()}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold">{count}</div>}
      </CardContent>
    </Card>
  )
}

