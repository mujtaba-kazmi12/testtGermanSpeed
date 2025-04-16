"use client"

import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, BarChart4, Shield, Zap, LucideIcon } from "lucide-react"
import { Sparkles, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from 'next-intl';

// Define feature interface for type safety
interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
  gradient: string;
  iconColor: string;
}

export function FeaturesSection() {
  const t = useTranslations('FeaturesSection');

  // Memoize animation variants to prevent recreation on each render
  const container = React.useMemo(() => ({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }), []);

  const item = React.useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }), []);

  // Create features array only once using translation keys
  const features: Feature[] = React.useMemo(() => [
    {
      icon: Search,
      title: t('feature1Title'),
      text: t('feature1Text'),
      gradient: "from-blue-500 to-cyan-400",
      iconColor: "text-blue-500"
    },
    {
      icon: BarChart4,
      title: t('feature2Title'),
      text: t('feature2Text'),
      gradient: "from-violet-500 to-purple-400",
      iconColor: "text-violet-500"
    },
    {
      icon: Shield,
      title: t('feature3Title'),
      text: t('feature3Text'),
      gradient: "from-amber-500 to-orange-400",
      iconColor: "text-amber-500"
    },
    {
      icon: Zap,
      title: t('feature4Title'),
      text: t('feature4Text'),
      gradient: "from-emerald-500 to-green-400",
      iconColor: "text-emerald-500"
    },
  ], [t]);

  return (
    <section className="w-full flex justify-center items-center py-12 md:py-24 lg:py-32 bg-[#f9f5ff]">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 text-center">
        {/* Badge & Heading */}
        <div className="space-y-4 mb-12">
          <Badge className="inline-flex bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-700 border-violet-200 hover:bg-gradient-to-r hover:from-violet-500/30 hover:to-fuchsia-500/30">
            <Sparkles className="mr-1 h-3 w-3" /> {t('badge')}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl glow-text">
            <span className="gradient-text">{t('title1')}</span> {t('title2')}
          </h1>
          <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
            {t('description')}
          </p>
        </div>

        {/* Cards Grid - Optimized rendering with lazyMotion */}
        <motion.div
          className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center items-center text-center"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index} 
                variants={item} 
                whileHover={{ y: -5 }} 
                transition={{ type: "spring", stiffness: 300 }}
                className="feature-card-container"
              >
                <Card className="h-[260px] bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group w-[260px] mx-auto flex flex-col">
                  <CardHeader className="p-4 pb-2 flex-shrink-0">
                    <div className={`size-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-3 mx-auto group-hover:scale-105 transition-transform duration-300`}>
                      <div className="size-full rounded-xl bg-white flex items-center justify-center">
                        <Icon className={`size-5 ${feature.iconColor}`} />
                      </div>
                    </div>
                    <CardTitle className="font-bold text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow flex items-start">
                    <p className="text-muted-foreground text-sm">{feature.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection; 