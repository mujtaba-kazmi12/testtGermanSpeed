export interface Product {
  id: string;
  _id: string;
  Authorlink: string;
  adjustedPrice: number;
  language: string;
  domainAuthority: number;
  country: string;
  wordLimit: number; 
  category: string[];
  currency: string; 
  monthlyTraffic: number;
  ratings: number;
  websiteUrl: string;
  approxPublicationTime: number; 
  liveTime: string; 
  maxLinkAllowed: number; 
  linkType: string; 
  siteName: string;
  price: number;
  commissionedPrice: number; 
  comissionedPrice:number ;
  products: string[];
}

export interface ApiResponse {
  message: string;
  data: {
    id: string;
    totalAmount: number; 
    createdAt: string;
    updatedAt: string;
    user: User;
    products: Product[];
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  country: string;
  currency: string;
  ownsSite: boolean;
  numberOfSites?: number; 
  hasDoFollowLinks: boolean;
  sellingArticles: boolean;
  businessName: string;
  referralCode: string;
  isAffiliate: boolean;
  isApproved: boolean;
  referredBy?: string | null; 
}
