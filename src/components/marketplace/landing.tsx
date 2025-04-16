"use client"

import { useState } from "react"
import { Header } from "./header"
import { HeroSection } from "./hero-section"
import MarketplaceSection from "./marketplace-section"
import { TestimonialsSection } from "./testimonials"
import { CTASection } from "./cta-section"
import { Footer } from "./footer"
import { FloatingCartButton } from "@/components/cart/FloatingCartButton"
import dynamic from 'next/dynamic';
const FeaturesSection = dynamic(() => import('./features-section'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
export default function MarketplaceLanding() {


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <MarketplaceSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  )
}

