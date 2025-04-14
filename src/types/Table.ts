
export interface Product {
  id: string
  siteName?: string
  title?: string
  category?: string[] | string
  author?: string
  productHandeledBy?: string
  rating: number
  views?: number
  price: number | string
  dateAdded?: Date | string
  createdAt?: string
  updatedAt?: string
  da?: number
  dr?: number
  domainAuthority?: number
  domainRatings?: number
  monthlyTraffic?: number
  country?: string
  websiteUrl?: string
  sampleLink?: string
  adjustedPrice?: string
  language?: string
  niche?: string
  currency?: string
  postingLink?: string
  poststatus?: string
  submittedPostUrl?: string
  linkType?: string
  maxLinkAllowed?: string
  Wordlimit?: string
  turnAroundTime?: string
  liveTime?: string
  siteType?: string
  isProductApprove?: boolean
  rejectionReason?: string | null
  productStatus?: string
  updateFields?: string | null
  user?: {
    id: string
  }
}

export interface ApiResponse {
    message: string;
    items: Product[]; 
    total: number;
    page: number;
    limit: number;
  }
  
  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    // Pagination:number;
  }
  

  export type ProductThanks = {
    productId: string;
    siteName: string;
    currency: string; // API response me "currency" hai
    adjustedPrice: string; // API response me string format me hai
    category: string[]; // API response me category ek array hai
    language: string; // API me "language" hai
    niche: string;
    publisherId: string;
    turnAroundTime: string;
    monthlyTraffic?: string | null; // API me nullable hai
    domainRatings?: number | null; // API me nullable hai
    domainAuthority?: number | null; // API me nullable hai
    productName: string;
    productCurrency: string;
    amount: number;
    productCategory: string[]; // Array of categories (e.g., ["Technology", "Business"])
    productDomain: number; // Represents domain authority
    productPrice: number; // Adjusted price
    productMonthlyTraffic: string; // Monthly traffic as a string
    productLanguage: string; // Language of the product
    productRatings: number; // Ratings or domain rating
  };
  
