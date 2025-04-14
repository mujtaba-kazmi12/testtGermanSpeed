export const ANALYTICS_CONFIG = {
  // Using environment variables for analytics IDs
  GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "",
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || "",
}; 