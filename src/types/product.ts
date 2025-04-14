export interface Product {
    id: string
    siteName: string
    websiteUrl: string
    sampleLink: string
    price: string
    adjustedPrice: string
    language: string
    niche: string
    country: string
    currency: string
    category: string[]
    productHandeledBy: string | null
    postingLink: string
    poststatus: string
    submittedPostUrl: string | null
    linkType: string
    maxLinkAllowed: string
    Wordlimit: string
    monthlyTraffic: number | null
    domainRatings: number | null
    domainAuthority: number | null
    turnAroundTime: string
    liveTime: string
    siteType: string
    isProductApprove: boolean
    rejectionReason: string | null
    productStatus: string
    updateFields: any | null
    createdAt: string
    updatedAt: string
  }
  
  