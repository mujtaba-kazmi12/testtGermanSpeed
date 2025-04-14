export interface OrderProduct {
    niche: string
    price: string
    category: string[]
    currency: string
    language: string
    siteName: string
    productId: string
    adjustPrice?: string
    adjustedPrice?: string
    domainRatings: number | null
    monthlyTraffic: number | null
    turnAroundTime: string
    domainAuthority: number | null
    publisherId?: string
  }
  
  export interface OrderUser {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
  
  export interface Order {
    id: string
    orderNumber: number
    file: string | null
    totalAmount: string
    contentProvidedBy: string
    orderStatus: "pending" | "accepted" | "rejected" | "inProgress" | "submitted" | "completed"
    address_qr_code: string
    payer_amount: string
    address: string
    url: string
    payer_currency: string
    uuid: string
    expired_at: string
    payment_status: string
    handeledBy: string | null
    rejectionReason: string | null
    submissionUrl: string | null
    submissionDetails: string | null
    submissionDate: string | null
    affiliateComission: number | null
    backupEmail: string
    Topic: string | null
    anchorLink: string | null
    anchor: string | null
    notes: string | null
    wordLimit: string | null
    products: OrderProduct[]
    createdAt: string
    updatedAt: string
    network: string
    to_currency: string
    user: OrderUser
  }
  
  export interface OrdersResponse {
    total: number
    items: Order[]
    page: string
    limit: string
  }
  
  