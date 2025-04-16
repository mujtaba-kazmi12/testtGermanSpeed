"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import HeroImage from "./hero-image"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from 'next-intl'
import { memo } from 'react'

// Memoize the hero heading to prevent unnecessary re-renders
const HeroHeading = memo(({ titlePart1, titlePart2 }: { titlePart1: string, titlePart2: string }) => (
  <h1 
    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
  >
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
      {titlePart1}
    </span>{' '}
    {titlePart2}
  </h1>
));

HeroHeading.displayName = 'HeroHeading';

export function HeroSection() {
  const router = useRouter();
  const currentLocale = useLocale();
  const t = useTranslations('HeroSection');
  
  const localePrefixed = (path: string) => `/${currentLocale}${path}`;
  
  const handleBrowse = () => {
    const element = document.getElementById('marketplace');
    if(element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-[rgba(247,236,251,255)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-violet-500/5 to-transparent opacity-70"></div>
      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <Badge className="inline-flex bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-700 border-violet-200 hover:bg-gradient-to-r hover:from-violet-500/30 hover:to-fuchsia-500/30">
                <Sparkles className="mr-1 h-3 w-3" /> {t('badge')}
              </Badge>
              
              {/* Optimized hero heading */}
              <HeroHeading titlePart1={t('title1')} titlePart2={t('title2')} />
              
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                {t('description')}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200 inline-flex items-center gap-2"
                onClick={() => {
                  router.push(localePrefixed("/sign-in"));
                }}
              >
                {t('getStarted')} <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-violet-300 hover:bg-violet-50 transition-all duration-300"
                onClick={() => {
                  router.push(localePrefixed("/about-us"));
                }}
              >
                {t('learnMore')}
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
            <div className="aspect-video overflow-hidden rounded-xl shadow-xl shadow-violet-200/50 animate-float">
              <HeroImage />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

