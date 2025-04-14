"use client"; // Add use client directive for hooks

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, MessageSquare } from "lucide-react"
// Import hooks
import { useLocale, useTranslations } from 'next-intl';

export function Footer() {
  const currentLocale = useLocale(); // Get current locale
  const t = useTranslations('footer'); // Initialize translations for footer namespace

  // Generate locale-prefixed links
  const localePrefixed = (path: string) => {
    // Avoid double slashes if path is just "/"
    return path === "/" ? `/${currentLocale}` : `/${currentLocale}${path}`;
  }

  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            {/* Use locale-prefixed link for logo */}
            <Link href={localePrefixed("/")} className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <MessageSquare className="size-4 text-white" />
              </div>
              {/* Use translated logo text */}
              <span className="font-bold text-xl">{t('logoText')}</span>
            </Link>
            {/* Use translated description */}
            <p className="text-muted-foreground max-w-xs">
              {t('description')}
            </p>
            {/* Social links - assuming these don't need locale prefix */}
            <div className="flex gap-4 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                <Facebook className="size-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                <Twitter className="size-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                <Instagram className="size-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                <Linkedin className="size-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div>
            {/* Use translated titles and links */}
            <h3 className="font-semibold mb-4">{t('platformTitle')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('platformLink1')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('platformLink2')}
                </Link>
              </li>
              <li>
                <Link href={localePrefixed("/pricing")} className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('platformLink3')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('platformLink4')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('companyTitle')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={localePrefixed("/about-us")} className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('companyLink2')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('companyLink3')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('companyLink4')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('supportTitle')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={localePrefixed("/faq")} className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('supportLink1')}
                </Link>
              </li>
              <li>
                <Link href={localePrefixed("/contact")} className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href={localePrefixed("/privacy-policy")} className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href={localePrefixed("/term-condition")} className="text-muted-foreground hover:text-violet-600 transition-colors">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Use translated copyright notice with year placeholder */}
          <p className="text-sm text-muted-foreground">{t('copyright', { year: currentYear })}</p>
          <div className="flex gap-4">
            {/* Use translated bottom links with locale prefix */}
            <Link href={localePrefixed("/contact")} className="text-sm text-muted-foreground hover:text-violet-600 transition-colors">
              {t('bottomLinkContact')}
            </Link>
            <Link href={localePrefixed("/privacy-policy")} className="text-sm text-muted-foreground hover:text-violet-600 transition-colors">
              {t('bottomLinkPrivacy')}
            </Link>
            <Link href={localePrefixed("/term-condition")} className="text-sm text-muted-foreground hover:text-violet-600 transition-colors">
              {t('bottomLinkTerms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
