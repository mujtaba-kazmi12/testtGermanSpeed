"use client"

import Link from "next/link"
import {  FileText, Shield, BookOpen, Copyright, AlertTriangle, Scale, Mail } from "lucide-react"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "../marketplace/footer"
import { Header } from "../marketplace/header"
import { useTranslations } from 'next-intl';

export default function TermsAndConditions() {
  const t = useTranslations('TermConditionPage');

  // Replace with your actual application name
  const appName = "German Guest Post"
  const supportEmail = "info@germanguestpost.com"
  const jurisdiction = "Germany" // Replace with your actual jurisdiction

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-[#f8f0ff] pb-16">
      {/* Header */}
      <div
              className="w-full py-16 px-4 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(160,32,240,0.15) 0%, rgba(160,32,240,0.05) 100%)",
                borderBottom: "1px solid rgba(160,32,240,0.1)",
              }}
            >
              <div className="container mx-auto max-w-4xl">
              
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 gradient-text" >
                {t('pageTitle')}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('pageSubtitle', { appName })}
                </p>
              </div>
            </div>


      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Section 1 */}
          <Card className="border shadow-md" style={{ borderColor: "rgba(160,32,240,0.1)" }}>
            <CardHeader className="bg-[rgba(160,32,240,0.05)] pb-3 pt-3" style={{marginTop:-25 ,borderRadius:10 }}>
              <div className="flex items-center gap-3 ">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: "rgba(160,32,240,0.1)",
                    color: "#a020f0",
                    
                  }}
                >
                  <BookOpen className="h-5 w-5" />
                </div>
                <CardTitle style={{ color: "#a020f0" }}>{t('section1Title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700">
                {t('section1Content')}
              </p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border shadow-md" style={{ borderColor: "rgba(160,32,240,0.1)" }}>
            <CardHeader className="bg-[rgba(160,32,240,0.05)] pb-3 pt-3" style={{marginTop:-25 ,borderRadius:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: "rgba(160,32,240,0.1)",
                    color: "#a020f0",
                  }}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle style={{ color: "#a020f0" }}>{t('section2Title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-4">{t('section2Intro')}</p>

              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="min-w-[20px] text-[#a020f0]">•</div>
                  <span>{t('section2Item1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="min-w-[20px] text-[#a020f0]">•</div>
                  <span>{t('section2Item2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="min-w-[20px] text-[#a020f0]">•</div>
                  <span>{t('section2Item3')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border shadow-md" style={{ borderColor: "rgba(160,32,240,0.1)" }}>
            <CardHeader className="bg-[rgba(160,32,240,0.05)] pb-3 pt-3" style={{marginTop:-25 ,borderRadius:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: "rgba(160,32,240,0.1)",
                    color: "#a020f0",
                  }}
                >
                  <Copyright className="h-5 w-5" />
                </div>
                <CardTitle style={{ color: "#a020f0" }}>{t('section3Title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700">
                {t('section3Content', { appName })}
              </p>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border shadow-md" style={{ borderColor: "rgba(160,32,240,0.1)" }}>
            <CardHeader className="bg-[rgba(160,32,240,0.05)] pb-3 pt-3" style={{marginTop:-25 ,borderRadius:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: "rgba(160,32,240,0.1)",
                    color: "#a020f0",
                  }}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle style={{ color: "#a020f0" }}>{t('section4Title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700">
                {t('section4Content')}
              </p>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border shadow-md" style={{ borderColor: "rgba(160,32,240,0.1)" }}>
            <CardHeader className="bg-[rgba(160,32,240,0.05)] pb-3 pt-3" style={{marginTop:-25 ,borderRadius:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: "rgba(160,32,240,0.1)",
                    color: "#a020f0",
                  }}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <CardTitle style={{ color: "#a020f0" }}>{t('section5Title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700">
                {t('section5Content')}
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card className="border shadow-md" style={{ borderColor: "rgba(160,32,240,0.1)" }}>
            <CardHeader className="bg-[rgba(160,32,240,0.05)] pb-3 pt-3" style={{marginTop:-25 ,borderRadius:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: "rgba(160,32,240,0.1)",
                    color: "#a020f0",
                  }}
                >
                  <Scale className="h-5 w-5" />
                </div>
                <CardTitle style={{ color: "#a020f0" }}>{t('section6Title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700">
                {t('section6Content', { jurisdiction })}
              </p>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card className="border shadow-md" style={{ borderColor: "rgba(160,32,240,0.1)" }}>
            <CardHeader className="bg-[rgba(160,32,240,0.05)] pb-3 pt-3" style={{marginTop:-25 ,borderRadius:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: "rgba(160,32,240,0.1)",
                    color: "#a020f0",
                  }}
                >
                  <Mail className="h-5 w-5" />
                </div>
                <CardTitle style={{ color: "#a020f0" }}>{t('section7Title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-4">
                {t('section7Intro')}
              </p>

              <div className="bg-[rgba(160,32,240,0.05)] border border-[rgba(160,32,240,0.1)] p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#a020f0]" />
                  <span className="font-medium">{t('section7EmailLabel')}</span>
                  <Link href={`mailto:${supportEmail}`} className="text-[#a020f0] hover:underline">
                    {supportEmail}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
    <Footer/>
    </>
  )
}

