"use client"

import React, { Suspense } from "react"
import { Header } from "./header"
import { HeroSection } from "./hero-section"
import MarketplaceSection from "./marketplace-section"
import { TestimonialsSection } from "./testimonials"
import { CTASection } from "./cta-section"
import { Footer } from "./footer"
import { FloatingCartButton } from "@/components/cart/FloatingCartButton"
import dynamic from 'next/dynamic';

// Optimize FeaturesSection with improved loading and enabling SSR
const FeaturesSection = dynamic(() => import('./features-section'), {
  ssr: true,
  loading: () => <div className="h-[300px] flex items-center justify-center"><div className="animate-pulse">Loading features...</div></div>,
});

export default function MarketplaceLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <MarketplaceSection />
      
      {/* Use Suspense for below-the-fold components */}
      <Suspense fallback={<div className="h-[300px]" />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<div className="h-[300px]" />}>
        <CTASection />
      </Suspense>
      
      {/* Footer is now a client component with performance optimizations */}
      <Footer />
      
      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  )
}

