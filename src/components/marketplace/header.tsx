"use client";

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, MessageSquare, UserRound, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { CartIndicator } from "@/components/cart/CartIndicator"
import { useLocale, useTranslations } from 'next-intl'
import { MobileNav } from "./mobile-nav"
import { useEffect, useState, useTransition } from "react"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const t = useTranslations('Header')
  const [token, setToken] = useState<string | null>(null)
  // const [menuOpen, setMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const cookieToken = Cookies.get("token")
    const role = Cookies.get("role")
    if (cookieToken) {
      setToken(cookieToken)
      setUserRole(role || null)
    }
  }, [])

  const isRegularUser = userRole === "user"

  const changeLocale = (nextLocale: string) => {
    startTransition(() => {
      const currentPathWithoutLocale = pathname.replace(`/${currentLocale}`, '')
      const newPath = `/${nextLocale}${currentPathWithoutLocale || '/'}`
      router.replace(newPath)
    })
  }

  const handleNavigation = (sectionId: string, href: string) => {
    router.push(`/${currentLocale}${href}`)
  }

  const handleLogoClick = () => {
    router.push(`/${currentLocale}/`)
  }

  const localePrefixed = (path: string) => `/${currentLocale}${path}`

  const redirectToDashboard = () => {
    if (userRole === "user") {
      router.push("/user/dashboard")
    } else if (userRole === "publisher") {
      router.push("/publisher/dashboard")
    } else if (userRole === "moderator") {
      router.push("/moderator/dashboard")
    } else if (userRole === "superadmin") {
      router.push("/admin/dashboard")
    }
  }

  const handleLogout = () => {
    Cookies.remove("token")
    Cookies.remove("role")
    Cookies.remove("userId")
    Cookies.remove("permissions")
    setToken(null)
    setUserRole(null)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo on the left */}
          <div className="flex items-center">
            <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
              <div className="size-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center glow">
                <MessageSquare className="size-4 text-white" />
              </div>
              <span className="font-bold text-xl">{t('logoText')}</span>
            </div>
          </div>

          {/* Navigation in the center */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href={localePrefixed("/")}
              className="text-sm font-medium hover:text-violet-600 transition-colors"
              onClick={() => handleNavigation("home", "/")}
            >
              {t('home')}
            </Link>
            <Link
              href={localePrefixed("/contact")}
              className="text-sm font-medium hover:text-violet-600 transition-colors"
              onClick={() => handleNavigation("contact", "/contact")}
            >
              {t('contact')}
            </Link>
            <Link
              href={localePrefixed("/about-us")}
              className="text-sm font-medium hover:text-violet-600 transition-colors"
              onClick={() => handleNavigation("about-us", "/about-us")}
            >
              {t('aboutUs')}
            </Link>
            <Link
              href={localePrefixed("/pricing")}
              className="text-sm font-medium hover:text-violet-600 transition-colors"
              onClick={() => handleNavigation("pricing", "/pricing")}
            >
              {t('pricing')}
            </Link>
          </nav>

          {/* Right side elements */}
          <div className="flex items-center gap-4">
            {/* Language Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 hover:bg-violet-100 shadow-md bg-white"
                  aria-label={t('switchLanguage')}
                  disabled={isPending}
                >
                  <Globe className="h-5 w-5 text-violet-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white text-gray-800 shadow-lg rounded-lg p-2 w-48">
                <DropdownMenuLabel>{t('switchLanguage')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => changeLocale('en')}
                  className={`hover:bg-gray-200 p-2 rounded-lg ${currentLocale === 'en' ? 'bg-gray-100 font-semibold' : ''} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isPending || currentLocale === 'en'}
                >
                  {t('english')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLocale('de')}
                  className={`hover:bg-gray-200 p-2 rounded-lg ${currentLocale === 'de' ? 'bg-gray-100 font-semibold' : ''} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isPending || currentLocale === 'de'}
                >
                  {t('german')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart Indicator with Counter */}
            <div>
              <CartIndicator className="" />
            </div>

            {token && isRegularUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full p-2 hover:bg-violet-100 shadow-md bg-white"
                    aria-label="User profile"
                  >
                    <UserRound className="h-5 w-5 text-violet-600" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="bg-white text-gray-800 shadow-lg rounded-lg p-2 w-48">
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(localePrefixed("/user/orders"))
                    }}
                    className="hover:bg-gray-200 p-2 rounded-lg"
                  >
                    {t('dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                  >
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : token && !isRegularUser ? (
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={handleLogout}
              >
                {t('logout')}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="hidden md:block"
                  onClick={() => {
                    router.push(localePrefixed("/sign-in"))
                  }}
                >
                  {t('signIn')}
                </Button>
                <Button
                  className="hidden md:inline-flex bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200"
                  onClick={() => {
                    router.push(localePrefixed("/sign-up"))
                  }}
                >
                  {t('getStarted')}
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden p-2 rounded-lg shadow-md">
                  <Menu className="h-6 w-6 text-gray-700" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-6 md:p-8">
                <MobileNav />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
