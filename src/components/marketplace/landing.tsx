"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Eye,
  Filter,
  Search,
  Star,
  TrendingUp,
  Users,
  Menu,
  ChevronRight,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  BarChart4,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Header } from "./header"
import { HeroSection } from "./hero-section"
import  MarketplaceSection from "./marketplace-section"
import { FeaturesSection } from "./features-section"
import { TestimonialsSection } from "./testimonials"
import { CTASection } from "./cta-section"
import { Footer } from "./footer"
import { FloatingCartButton } from "@/components/cart/FloatingCartButton"

export default function MarketplaceLanding() {
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [viewsRange, setViewsRange] = useState([0, 10000])
  
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

