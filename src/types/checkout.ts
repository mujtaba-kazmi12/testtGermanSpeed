export interface Order {
  orderNumber: string;
  product: string;
  user: string;
  websiteUrl: string;
  postUrl: string;
  keyWord: string;
  orderStatus: string;
  totalAmount: string;
  websiteURL:string;
  url: string;
  uuid: string;
  expired_at: string;
  payment_status: string;
  handledBy: string | null;
  price: string;
    id: string;
     
      file: string | null;
     
      rejectionReason?: string | null;
      submissionUrl?: string | null;
      submissionDetails?: string | null;
      submissionDate?: string | null;
      affiliateCommission?: number | null; // API mein "affiliateComission" hai, spelling fix ki hai
      backupEmail: string;
      Topic?: string | null;
      anchorLink?: string | null;
      anchor?: string | null;
      notes?: string | null;
      wordLimit?: string | null;
      products: Product[];
      createdAt: string;
      updatedAt: string;
}

export interface CheckOutApiResponse {
  message: string;
  data: { // ✅ Added `data` inside the response
    orderNumber: number;
    url: string;
    uuid: string;
    expired_at: string;
    payment_status: string;
    address_qr_code: string;
    // ✅ Missing Fields Added
    address: string;
    payer_amount: number;
    payer_currency: string;
    network: string;
  };

  orders?: Order[]; // Keeping optional if it's not always present
  status?: number;
}
export interface Product {
  niche: string;
  websiteURL:string;
  url: string;
  category: string;
  currency: string;
  language: string;
  siteName: string;
  productId: string;
  adjustedPrice?: string;  // API mein kuch jagah "adjustedPrice" aur kuch jagah "adjustPrice" hai
  turnAroundTime: string;
}
export interface OrdersApiResponse {
    total: any; // Total number of orders
    limit: any; // Optional limit property
    items: Order[]; // Change ProductOrders[] to Order[]
}
