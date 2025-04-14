export interface AdminStatsResponse {
  message: string
  data: AdminStats
}

export interface PublisherStatsResponse {
  message: string
  data: PublisherStats
}

// Monthly statistics for admin
export interface AdminMonthlyStats {
  month: number
  approvedPublishers: number
  pendingPublishers: number
  approvedProducts: number
  pendingProducts: number
  rejectedProducts: number
}

// Monthly statistics for publisher
export interface PublisherMonthlyStats {
  month: number
  totalProducts: number
  approvedProducts: number
  pendingProducts: number
  totalOrders: number
  pendingOrders: number
  acceptedOrders: number
}

export interface AdminStats {
  monthlyStats: AdminMonthlyStats[]
  pendingPublishersThisMonth: number
  approvedPublishersThisMonth: number
  pendingProductsThisMonth: number
  approvedProductsThisMonth: number
  totalPublishers: number
  approvedPublishers: number
  pendingPublishers: number
  approvedWithdrawals: number
  totalProducts: number
  approvedProducts: number
  pendingProducts: number
  pendingWithdrawal: number
  totalwithdrawls: number
  totalModerators: number
  // For chart data (if available in your API)
  orderStats?: OrderStat[]
  productStats?: ProductStat[]
}

export interface PublisherStats {
  monthlyStats: PublisherMonthlyStats[]
  totalProducts: number
  approvedProducts: number
  pendingProducts: number
  totalOrders: number
  pendingOrders: number
  acceptedOrders: number
}

export interface OrderStat {
  date: string
  acceptedOrders: number
  pendingOrders: number
}

export interface ProductStat {
  date: string
  approvedProducts: number
  pendingProducts: number
}

// Union type that can be either AdminStats or PublisherStats
export type DashboardStats = AdminStats | PublisherStats
