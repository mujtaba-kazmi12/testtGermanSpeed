"use client"
import {
 
  Mail,
  Shield,
  User,
  BarChart,
  FileText,
  Share2,
  Cookie,
  UserCheck,
  RefreshCw,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "../marketplace/footer"
import { Header } from "../marketplace/header"
import { useTranslations, useLocale } from 'next-intl';

export default function PrivacyPolicy() {
  const t = useTranslations('PrivacyPolicyPage');
  const currentLocale = useLocale();

  const appName = "Guest Post Manager"
  const supportEmail = "support@yourdomain.com"

  const localePrefixed = (path: string) => `/${currentLocale}${path}`;

  return (
    <>
    <Header/>
    <div style={{ backgroundColor: "#f8f0ff" }} className="min-h-screen pb-16">
      {/* Header */}
      <div
        className="w-full py-16 px-4 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(160,32,240,0.15) 0%, rgba(160,32,240,0.05) 100%)",
          borderBottom: "1px solid rgba(160,32,240,0.1)",
        }}
      >
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 " style={{ color: "#a020f0" }}>
            {t('pageTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pageSubtitle')}
          </p>
        </div>
      </div>


      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="mb-10 border shadow-lg overflow-hidden" style={{ borderColor: "#a020f020" }}>
          <CardHeader className="rounded-t-lg" style={{ backgroundColor: "#a020f010" , marginTop:-25 }}>
            <CardTitle className="text-2xl" style={{ color: "#a020f0" , paddingTop:"10px" }}>
              {t('introTitle')}
            </CardTitle>
            <CardDescription style={{paddingBottom:"10px"}}>{t('introSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-base leading-7">
              {t('introParagraph', { appName })}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Section 1 */}
          <Card className="border shadow-lg overflow-hidden" style={{ borderColor: "#a020f020" }}>
            <CardHeader className="rounded-t-lg" style={{ backgroundColor: "#a020f010" , marginTop:-25 , paddingTop:15 , paddingBottom:10 }}>
              <div className="flex items-center gap-3 ">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full "
                  style={{ backgroundColor: "#a020f015"  }}
                >
                  <User className="h-5 w-5" style={{ color: "#a020f0" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#a020f0"  }}>
                  {t('section1Title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">{t('section1Intro')}</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <span className="font-semibold">{t('section1Item1Title')}</span> {t('section1Item1Text')}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <span className="font-semibold">{t('section1Item2Title')}</span> {t('section1Item2Text')}
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border shadow-lg overflow-hidden" style={{ borderColor: "#a020f020" }}>
            <CardHeader className="rounded-t-lg" style={{ backgroundColor: "#a020f010" , marginTop:-25 , paddingTop:15 , paddingBottom:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#a020f015" }}
                >
                  <BarChart className="h-5 w-5" style={{ color: "#a020f0" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#a020f0" }}>
                  {t('section2Title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">{t('section2Intro')}</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>{t('section2Item1')}</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>{t('section2Item2')}</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>{t('section2Item3')}</div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border shadow-lg overflow-hidden" style={{ borderColor: "#a020f020" }}>
            <CardHeader className="rounded-t-lg" style={{ backgroundColor: "#a020f010" , marginTop:-25 , paddingTop:15 , paddingBottom:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#a020f015" }}
                >
                  <Shield className="h-5 w-5" style={{ color: "#a020f0" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#a020f0" }}>
                  {t('section3Title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-base leading-7">
                {t('section3Paragraph')}
              </p>
              <div
                className="mt-6 p-4 rounded-lg"
                style={{ backgroundColor: "#a020f010", border: "1px dashed #a020f030" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" style={{ color: "#a020f0" }} />
                  <span className="font-medium">{t('section3BoxTitle')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('section3BoxText')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border shadow-lg overflow-hidden" style={{ borderColor: "#a020f020" }}>
            <CardHeader className="rounded-t-lg" style={{ backgroundColor: "#a020f010" , marginTop:-25 , paddingTop:15 , paddingBottom:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#a020f015" }}
                >
                  <Share2 className="h-5 w-5" style={{ color: "#a020f0" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#a020f0" }}>
                  {t('section4Title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">
                {t('section4Intro')}
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>{t('section4Item1')}</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>{t('section4Item2')}</div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border shadow-lg overflow-hidden" style={{ borderColor: "#a020f020" }}>
            <CardHeader className="rounded-t-lg" style={{ backgroundColor: "#a020f010" , marginTop:-25 , paddingTop:15 , paddingBottom:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#a020f015" }}
                >
                  <Cookie className="h-5 w-5" style={{ color: "#a020f0" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#a020f0" }}>
                  {t('section5Title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-base leading-7">
                {t('section5Paragraph')}
              </p>
              <Button className="mt-6" variant="outline" style={{ borderColor: "#a020f050", color: "#a020f0" }}>
                {t('section5Button')}
              </Button>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card className="border shadow-lg overflow-hidden" style={{ borderColor: "#a020f020" }}>
            <CardHeader className="rounded-t-lg" style={{ backgroundColor: "#a020f010" , marginTop:-25 , paddingTop:15 , paddingBottom:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#a020f015" }}
                >
                  <UserCheck className="h-5 w-5" style={{ color: "#a020f0" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#a020f0" }}>
                  {t('section6Title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">{t('section6Intro')}</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>{t('section6Item1')}</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>{t('section6Item2')}</div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card className="border shadow-lg overflow-hidden" style={{ borderColor: "#a020f020" }}>
            <CardHeader className="rounded-t-lg" style={{ backgroundColor: "#a020f010" , marginTop:-25 , paddingTop:15 , paddingBottom:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#a020f015" }}
                >
                  <RefreshCw className="h-5 w-5" style={{ color: "#a020f0" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#a020f0" }}>
                  {t('section7Title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-base leading-7">
                {t('section7Paragraph')}
              </p>
              <div
                className="mt-6 p-4 rounded-lg"
                style={{ backgroundColor: "#a020f010", border: "1px dashed #a020f030" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" style={{ color: "#a020f0" }} />
                  <span className="font-medium">{t('section7BoxTitle')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('section7BoxText')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card className="border shadow-lg overflow-hidden" style={{ borderColor: "#a020f020" }}>
            <CardHeader className="rounded-t-lg" style={{ backgroundColor: "#a020f010" , marginTop:-25 , paddingTop:15 , paddingBottom:10 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#a020f015" }}
                >
                  <HelpCircle className="h-5 w-5" style={{ color: "#a020f0" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#a020f0" }}>
                  {t('section8Title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-6">
                {t('section8Intro')}
              </p>
              <div
                className="p-4 rounded-lg flex items-center gap-3"
                style={{
                  background: "linear-gradient(135deg, rgba(160,32,240,0.1) 0%, rgba(160,32,240,0.05) 100%)",
                  border: "1px solid #a020f030",
                }}
              >
                <Mail className="h-5 w-5" style={{ color: "#a020f0" }} />
                <div>
                  <span className="font-medium">{t('section8EmailLabel')}</span>
                  <Link href={`mailto:${supportEmail}`} className="ml-2 hover:underline" style={{ color: "#a020f0" }}>
                    {supportEmail}
                  </Link>
                </div>
              </div>
              <Link href={localePrefixed("/contact")} passHref>
              <Button
                className="w-full mt-6 cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-600"
                style={{borderColor: "#a020f0", color: "white" }}
              >
                <Mail className="mr-2 h-4 w-4" />
                  {t('section8Button')}
              </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  )
}

