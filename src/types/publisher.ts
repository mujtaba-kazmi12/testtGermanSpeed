
export interface CreateProductPayload {
    siteName: string
    websiteUrl: string
    language: string
    country: string
    currency: string
    liveTime: string
    niche: string
    turnAroundTime: string
    maxLinkAllowed: string
    wordLimit: string
    category: string[]
    linkType: string
    siteType: string
    sampleLink?: string
    linkInsertionPrice?: number
    newPostPrice?: number
  }
  
  /**
   * Response from create product API
   */
  export interface CreateProductResponse {
    success: boolean
    message: string
    data: Data // Array of product data
  }

  export interface Data {
    postingLink:string
  }
  
  /**
   * Product/Post data structure
   */
  export interface Product {
    id: string
    siteName: string
    websiteUrl: string
    language: string
    country: string
    currency: string
    liveTime: string
    niche: string
    turnAroundTime: string
    maxLinkAllowed: string
    wordLimit: string
    category: string[]
    linkType: string
    siteType: string
    sampleLink?: string
    linkInsertionPrice?: number
    newPostPrice?: number
    createdAt: string
    updatedAt: string
    status: string
    postingLink: string
    submittedPostUrl?: string
  }
  
  /**
   * Response for getting publisher products
   */
  export interface GetPublisherProductsResponse {
    success: boolean
    message: string
    data: {
      products: Product[]
      total: number
      page: number
      limit: number
    }
  }
  
  /**
   * Form data for creating a product
   */
  export interface ProductFormData {
    siteName: string
    websiteUrl: string
    authorLink: string
    language: string
    country: string
    currency: string
    liveTime: string
    niche: string
    turnAroundTime: string
    maxLinkAllowed: string
    wordLimit: string
    linkInsertionPrice: string
    newPostPrice: string
  }
  
  /**
   * Response for submitting a posting link
   */
  export interface SubmitPostingLinkResponse {
    success: boolean
    message: string
    data: {
      id: string
      status: string
      [key: string]: any
    }
  }
  
  export interface Publisher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNo?: string;
    country?:string;
    businessName?: string;
    walletBalance: string;
    currency: string;
    businessType?: string;
    referralCode: string;
    isVerified: boolean;
    isApproved: boolean;
    isaffiliateRequested: boolean;
    numberOfSites: number;
  }