"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, HelpCircle, Star, Shield, Zap, ArrowRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Footer } from "../marketplace/footer"
import { Header } from "../marketplace/header"
import { useTranslations, useLocale } from 'next-intl';

export default function Pricing() {
  const t = useTranslations('PricingPage');
  const currentLocale = useLocale();

  const appName = "German Guest Post"

  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")

  const pricingTiers = [
    {
      name: t('tier1Name'),
      description: t('tier1Description'),
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        { name: t('tier1Feature1'), included: true },
        { name: t('tier1Feature2'), included: true },
        { name: t('tier1Feature3'), included: true },
        { name: t('tier1Feature4'), included: true },
        { name: t('tier1Feature5'), included: true },
        { name: t('tier1Feature6'), included: true },
        { name: t('tier1Feature7'), included: false },
        { name: t('tier1Feature8'), included: false },
        { name: t('tier1Feature9'), included: false },
      ],
      popular: false,
      icon: <Shield className="h-5 w-5" />,
    },
    {
      name: t('tier2Name'),
      description: t('tier2Description'),
      monthlyPrice: 249,
      annualPrice: 2490,
      features: [
        { name: t('tier2Feature1'), included: true },
        { name: t('tier2Feature2'), included: true },
        { name: t('tier2Feature3'), included: true },
        { name: t('tier2Feature4'), included: true },
        { name: t('tier2Feature5'), included: true },
        { name: t('tier2Feature6'), included: true },
        { name: t('tier2Feature7'), included: true },
        { name: t('tier2Feature8'), included: false },
        { name: t('tier2Feature9'), included: false },
      ],
      popular: true,
      icon: <Star className="h-5 w-5" />,
    },
    {
      name: t('tier3Name'),
      description: t('tier3Description'),
      monthlyPrice: 499,
      annualPrice: 4990,
      features: [
        { name: t('tier3Feature1'), included: true },
        { name: t('tier3Feature2'), included: true },
        { name: t('tier3Feature3'), included: true },
        { name: t('tier3Feature4'), included: true },
        { name: t('tier3Feature5'), included: true },
        { name: t('tier3Feature6'), included: true },
        { name: t('tier3Feature7'), included: true },
        { name: t('tier3Feature8'), included: true },
        { name: t('tier3Feature9'), included: true },
      ],
      popular: false,
      icon: <Zap className="h-5 w-5" />,
    },
  ]

  const localePrefixed = (path: string) => `/${currentLocale}${path}`;

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-[#f8f0ff] pb-16">
      <div
        className="w-full py-16 px-4 text-center mb-10"
        style={{
          background: "linear-gradient(135deg, rgba(160,32,240,0.15) 0%, rgba(160,32,240,0.05) 100%)",
          borderBottom: "1px solid rgba(160,32,240,0.1)",
        }}
      >
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: "#a020f0" }}>
            {t('pageTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pageSubtitle')}
          </p>
           <div className="flex justify-center mt-8  ">
            <Tabs
              defaultValue="monthly"
              value={billingPeriod}
              onValueChange={(value) => setBillingPeriod(value as "monthly" | "annually")}
              className="w-full max-w-md"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">{t('billingMonthly')}</TabsTrigger>
                <TabsTrigger value="annually">
                  {t('billingAnnually')}
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "rgba(160,32,240,0.1)",
                      color: "#a020f0",
                    }}
                  >
                    {t('billingSave')}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
        </div>
        
      </div>


      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`border shadow-md relative ring-1 ring-[#a020f0] ${tier.popular ? "ring-2 ring-[#a020f0]" : ""}`}
                style={{ borderColor: tier.popular ? "#a020f0" : "rgba(160,32,240,0.1)" }}
              >
                {tier.popular && (
                  <div
                    className="absolute top-0  left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600"
                    style={{
                     
                      color: "white",
                    }}
                  >
                    {t('popularBadge')}
                  </div>
                )}
                <CardHeader
                  className="pb-4"
                  style={{
                    backgroundColor: tier.popular ? "rgba(160,32,240,0.1)" : "transparent"
                    , marginTop:-25
                  }}
                >
                  <div className="flex items-center gap-2 mb-2 pt-8">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full "
                      style={{
                        backgroundColor: "rgba(160,32,240,0.1)",
                        color: "#a020f0",

                      }}
                    >
                      {tier.icon}
                    </div>
                    <CardTitle style={{ color: "#a020f0"  }}>{tier.name}</CardTitle>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-6">
                    <p className="text-4xl font-bold gradient-text" style={{ color: "#a020f0" }}>
                      €{billingPeriod === "monthly" ? tier.monthlyPrice : tier.annualPrice}
                    </p>
                    <p className="text-sm text-gray-500">
                      {billingPeriod === "monthly" ? t('pricePerMonth') : t('pricePerYear')}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? "text-gray-700" : "text-gray-400"}>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <Link href={localePrefixed("/contact")} passHref>
                <CardFooter>
                
                  <Button
                    className="w-full"
                    style={{
                      backgroundColor: tier.popular ? "#a020f0" : "white",
                      color: tier.popular ? "white" : "#a020f0",
                      borderColor: "#a020f0",
                      borderWidth: "1px",
                      cursor:"pointer"
                    }}
                  >
                    {t('getStartedButton')}
                  </Button>
                
                </CardFooter>
                </Link>
              </Card>
            ))}
          </div>

          <Card
            className="border shadow-md mt-12"
            style={{
              borderColor: "rgba(160,32,240,0.1)",
              background: "linear-gradient(135deg, rgba(160,32,240,0.15) 0%, rgba(160,32,240,0.05) 100%)",
            }}
          >
            <div className="md:flex items-center">
              <div className="md:w-2/3 p-8">
                <h2 className="text-2xl font-bold mb-2 gradient-text" >
                  {t('enterpriseTitle')}
                </h2>
                <p className="text-gray-700 mb-4">
                  {t('enterpriseDescription')}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('enterpriseFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('enterpriseFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('enterpriseFeature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('enterpriseFeature4')}</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/3 p-8 flex justify-center">
                <Link href={localePrefixed("/contact")} passHref>
                  <Button className="text-white bg-gradient-to-r from-violet-600 to-fuchsia-600" style={{ borderColor: "#a020f0" , cursor:"pointer" }}>
                    {t('contactSalesButton')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
    <Footer/>
    </>
  )
}

