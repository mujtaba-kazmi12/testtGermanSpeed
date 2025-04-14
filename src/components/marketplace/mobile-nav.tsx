"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import Cookies from "js-cookie"

export function MobileNav() {
  const router = useRouter()
  const t = useTranslations('navigation')
  
  const token = Cookies.get("token")
  const role = Cookies.get("role")
  const isRegularUser = role === "user"
  
  const handleLogout = () => {
    Cookies.remove("token")
    Cookies.remove("role")
    Cookies.remove("userId")
    Cookies.remove("permissions")
    router.push("/")
  }
  
  return (
    <div className="px-2 py-6">
      <nav className="flex flex-col gap-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 py-2 text-lg font-medium"
        >
          {t('home')}
        </Link>
        <Link 
          href="/Services" 
          className="flex items-center gap-2 py-2 text-lg font-medium"
        >
          {t('services')}
        </Link>
        <Link 
          href="/pricing" 
          className="flex items-center gap-2 py-2 text-lg font-medium"
        >
          {t('pricing')}
        </Link>
        <Link 
          href="/about-us" 
          className="flex items-center gap-2 py-2 text-lg font-medium"
        >
          {t('about')}
        </Link>
        <Link 
          href="/contact" 
          className="flex items-center gap-2 py-2 text-lg font-medium"
        >
          {t('contact')}
        </Link>
        <Link 
          href="/faq" 
          className="flex items-center gap-2 py-2 text-lg font-medium"
        >
          {t('faq')}
        </Link>
        
        <div className="mt-4">
          <LanguageSwitcher />
        </div>
        
        <div className="mt-6 border-t pt-6">
          {token ? (
            <>
              {isRegularUser && (
                <Link 
                  href="/user/dashboard" 
                  className="flex items-center gap-2 py-2 text-lg font-medium"
                >
                  {t('dashboard')}
                </Link>
              )}
              <Button 
                variant="destructive" 
                className="w-full mt-4" 
                onClick={handleLogout}
              >
                {t('logout')}
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <Button asChild>
                <Link href="/sign-in">
                  {t('login')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sign-up">
                  {t('register')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
} 