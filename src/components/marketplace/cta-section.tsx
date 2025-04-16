"use client";

import React, { useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ArrowRight, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from 'next-intl';

// Memoized list item component to prevent unnecessary re-renders
const CTAListItem = memo(({ text }: { text: string }) => (
  <div className="flex items-center gap-2">
    <ChevronRight className="size-4" />
    <p>{text}</p>
  </div>
));

CTAListItem.displayName = 'CTAListItem';

export function CTASection() {
  const router = useRouter()
  const currentLocale = useLocale();
  const t = useTranslations('CTASection');

  const localePrefixed = useCallback((path: string) => 
    `/${currentLocale}${path}`, [currentLocale]);

  const handleSignInClick = useCallback(() => {
    router.push(localePrefixed('/sign-in'));
  }, [router, localePrefixed]);

  const handleContactClick = useCallback(() => {
    router.push(localePrefixed('/contact'));
  }, [router, localePrefixed]);

  // Memoize list items for better performance
  const listItems = React.useMemo(() => [
    t('listItem1'),
    t('listItem2'),
    t('listItem3'),
    t('listItem4')
  ], [t]);

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-cta-pattern text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90"></div>
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl glow-text">
                {t('title')}
              </h2>
              <p className="max-w-[600px] md:text-xl/relaxed opacity-90">
                {t('description')}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-violet-700 hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center gap-2"
                onClick={handleSignInClick}
              >
                {t('getStartedButton')} <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10 transition-all duration-300"
                onClick={handleContactClick}
              >
                {t('contactButton')}
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
            <div className="aspect-video overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm p-6 border border-white/30 shadow-xl">
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-white flex items-center justify-center shadow-md">
                    <MessageSquare className="size-6 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('boxTitle')}</h3>
                    <p className="text-sm opacity-80">{t('boxSubtitle')}</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  {listItems.map((item, index) => (
                    <CTAListItem key={index} text={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

