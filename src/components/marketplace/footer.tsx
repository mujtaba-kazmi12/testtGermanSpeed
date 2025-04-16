"use client";

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, MessageSquare } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl';
import { memo } from "react";

// Memoize the footer links component for better performance
const FooterLinks = memo(({ 
  title, 
  links 
}: { 
  title: string; 
  links: Array<{ href: string; label: string; isLocalePrefixed?: boolean }> 
}) => {
  const currentLocale = useLocale();
  
  const localePrefixed = (path: string) => {
    return path === "/" ? `/${currentLocale}` : `/${currentLocale}${path}`;
  };
  
  return (
    <div>
      <h3 className="font-semibold mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <Link 
              href={link.isLocalePrefixed ? localePrefixed(link.href) : link.href} 
              className="text-muted-foreground hover:text-violet-600 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

FooterLinks.displayName = "FooterLinks";

export function Footer() {
  const currentLocale = useLocale();
  const t = useTranslations('footer');

  // Generate locale-prefixed links
  const localePrefixed = (path: string) => {
    // Avoid double slashes if path is just "/"
    return path === "/" ? `/${currentLocale}` : `/${currentLocale}${path}`;
  }

  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  
  // Create link groups to reduce JSX complexity
  const platformLinks = [
    { href: "#", label: t('platformLink1') },
    { href: "#", label: t('platformLink2') },
    { href: "/pricing", label: t('platformLink3'), isLocalePrefixed: true },
    { href: "#", label: t('platformLink4') }
  ];
  
  const companyLinks = [
    { href: "/about-us", label: t('about'), isLocalePrefixed: true },
    { href: "#", label: t('companyLink2') },
    { href: "#", label: t('companyLink3') },
    { href: "#", label: t('companyLink4') }
  ];
  
  const supportLinks = [
    { href: "/faq", label: t('supportLink1'), isLocalePrefixed: true },
    { href: "/contact", label: t('contact'), isLocalePrefixed: true },
    { href: "/privacy-policy", label: t('privacy'), isLocalePrefixed: true },
    { href: "/term-condition", label: t('terms'), isLocalePrefixed: true }
  ];

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            {/* Logo & description */}
            <Link href={localePrefixed("/")} className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <MessageSquare className="size-4 text-white" />
              </div>
              <span className="font-bold text-xl">{t('logoText')}</span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              {t('description')}
            </p>
            {/* Social links */}
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
          
          {/* Use memoized link components */}
          <FooterLinks title={t('platformTitle')} links={platformLinks} />
          <FooterLinks title={t('companyTitle')} links={companyLinks} />
          <FooterLinks title={t('supportTitle')} links={supportLinks} />
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">{t('copyright', { year: currentYear })}</p>
          <div className="flex gap-4">
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
