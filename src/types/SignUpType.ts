// Types for the sign-up form and API integration

export interface CountryOption {
  value: string
  label: string
  phonePrefix: string
  currency: string
}

export interface CurrencyOption {
  value: string
  label: string
  symbol?: string
}

// Buyer/Advertiser form data
export interface BuyerFormProps {
  firstName: string
  lastName: string
  email: string
  password: string
  businessName: string
  selectedCountry: string
  currency: string
  monthlyBudget: number
  // role: string
}

// Publisher form data
export interface PublisherFormProps {
  firstName: string
  lastName: string
  email: string
  password: string
  country: string
  phoneNumber: string
  numberOfSites: number
  ownsSite: boolean
  hasDoFollowLinks: boolean
  sellingArticles: boolean
  businessName: string
  currency: string
  referedBy: string
  sellingArticlesURL: string
}

// API response for authentication
export interface AuthResponse {
  success: boolean
  message: string
  data?: any
}

// OTP verification request body
export interface VerifyOTPRequestBody {
  otp: string, // OTP entered by the user
  email: string // Email associated with the OTP
}

// OTP verification response
export interface VerifyOTPResponse {
  message: string // Success or failure message
  status: number // HTTP Status code
}

