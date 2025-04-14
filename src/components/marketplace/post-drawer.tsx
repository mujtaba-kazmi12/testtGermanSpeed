"use client"

import { X, Calendar, ExternalLink, Star, Users, Eye, Globe, LogIn, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Product } from "@/types/Table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState, useRef } from "react"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Custom animation styles - simplified like cart drawer
const customStyles = `
  .drawer-content-right {
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    max-width: 500px !important;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1) !important;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    z-index: 949 !important; /* Lower than floating cart */
    will-change: transform;
    pointer-events: auto !important;
  }

  .drawer-content-right[data-state="open"] {
    transform: translateX(0);
  }

  .drawer-content-right[data-state="closed"] {
    transform: translateX(100%);
  }
  
  /* Ensure the drawer backdrop doesn't block higher z-index elements */
  [data-sonner-toast][role=status] {
    z-index: 1060 !important;
  }
`

interface PostDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  post: Product | null
  loading?: boolean;
}

export function PostDrawer({ isOpen, onOpenChange, post }: PostDrawerProps) {
  const t = useTranslations('marketplace');
  const tNav = useTranslations('navigation');
  const [isAdding, setIsAdding] = useState(false);
  const isAddingRef = useRef(false);
  const { addToCart, error: cartError } = useCart();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Only add styles once - like cart drawer
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Reset isAdding state when drawer is opened or closed
  useEffect(() => {
    setIsAdding(false);
    isAddingRef.current = false;
  }, [isOpen]);

  // Track product detail view when drawer opens
  useEffect(() => {
    if (isOpen && post) {
      // Format product data - keeping non-standard fields EXCEPT country
      const productData = {
        item_id: post.id,
        item_name: post.siteName || post.title || "Untitled Post",
        item_category: Array.isArray(post.category) ? post.category.join(", ") : (post.category || "Uncategorized"),
        price: typeof post.price === 'string' ? parseFloat(post.price) : (post.price || 0),
        quantity: 1, // Quantity is usually 1 for view_item
        currency: post.currency || "EUR", // Kept non-standard param
        domain_authority: post.domainAuthority || post.da || 0, // Kept non-standard param
        domain_rating: post.domainRatings || post.dr || 0, // Kept non-standard param
        monthly_traffic: post.monthlyTraffic || 0, // Kept non-standard param
        language: post.language || "Unknown", // Kept non-standard param
        // country: post.country || "International" // REMOVED country specifically
      };

      // Push structure to dataLayer
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'view_item',
          ecommerce: {
            items: [productData]
          }
        });
        console.log("🔍 Product detail view tracked (without country):", productData);
      }
    }
  }, [isOpen, post]);

  const handleAddToCart = async () => {
    if (!post) return;

    // Check if user is logged in by looking for token
    const token = Cookies.get("token");
    const userRole = Cookies.get("role");

    if (!token) {
      // Close the drawer first, then show the auth modal
      onOpenChange(false);
      setTimeout(() => {
        setShowAuthModal(true);
      }, 300); // Match transition duration of drawer closing
      return;
    }

    // Check if the user has the "user" role
    if (userRole !== "user") {
      toast.error(t('toast.roleErrorTitle'), {
        description: t('toast.roleErrorDesc'),
        duration: 3000,
      });
      return;
    }

    // Prevent multiple clicks
    if (isAdding || isAddingRef.current) return;
    
    setIsAdding(true);
    isAddingRef.current = true;
    
    // Safety timeout - reset loading state after 3 seconds if it gets stuck
    const safetyTimeout = setTimeout(() => {
      console.log("Safety timeout triggered - resetting Add to Cart button");
      setIsAdding(false);
      isAddingRef.current = false;
    }, 3000);
    
    try {
      const result = await addToCart(post);
      console.log("Add to cart response:", result);
      
      // Immediately reset loading state after getting a response
      setIsAdding(false);
      isAddingRef.current = false;
      clearTimeout(safetyTimeout);
      
      if (result.message?.includes("not authenticated") || result.message?.includes("authenticated")) {
        // Close the drawer first, then show the auth modal
        onOpenChange(false);
        setTimeout(() => {
          setShowAuthModal(true);
        }, 300); // Match transition duration of drawer closing
        return;
      }
      
      // Show toast based on success status
      if (result.success) {
        // Map item - keeping non-standard fields EXCEPT country
        const mappedItem = {
          item_id: post.id,
          item_name: post.siteName || post.title || "",
          price: typeof post.price === 'string' ? parseFloat(post.price) : (post.price || 0),
          item_category: Array.isArray(post.category) ? post.category.join(", ") : (post.category || ""),
          quantity: 1,
          currency: post.currency || "EUR", // Kept non-standard param
          language: post.language || "", // Kept non-standard param
          domain_authority: post.domainAuthority || post.da || 0, // Kept non-standard param
          domain_rating: post.domainRatings || post.dr || 0, // Kept non-standard param
          monthly_traffic: post.monthlyTraffic !== undefined ? post.monthlyTraffic : 0, // Kept non-standard param
          // country: post.country || "" // REMOVED country specifically
        };

        console.log("🔍 Add to Cart - Item Data (without country):", mappedItem);

        // Push structure to dataLayer 
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'add_to_cart',
            ecommerce: {
              currency: post.currency || "EUR", 
              value: typeof post.price === 'string' ? parseFloat(post.price) : (post.price || 0),
              items: [mappedItem]
            }
          });
          console.log("🔍 DataLayer add_to_cart event pushed (without country in item)");
        }

        toast.success(result.message || t('toast.addSuccessTitle'), {
          description: t('toast.addSuccessDesc', { postTitle: post.siteName || post.title || t('drawer.untitledPost') }),
          duration: 3000,
        });
        
        // Maybe close the drawer after successful add
        // setTimeout(() => {
        //   onOpenChange(false);
        // }, 1500);
      } else {
        toast.error(result.message || t('toast.addErrorTitle'), {
          description: t('toast.addErrorDesc'),
          duration: 3000,
        });
      }
    }
    catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error(t('toast.unexpectedErrorTitle'), {
        description: t('toast.unexpectedErrorDesc'),
        duration: 3000,
      });
    } finally {
      // Force reset loading state regardless of what happened
      clearTimeout(safetyTimeout);
      setIsAdding(false);
      isAddingRef.current = false;
      console.log("Add to cart operation completed, button reset");
    }
  };

  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    router.push("/sign-in");
  };

  if (!post) return null

  // Format values for display
  const postTitle = post.siteName || post.title || t('drawer.untitledPost')
  const postCategory = Array.isArray(post.category)
    ? post.category.join(', ')
    : post.category || t('drawer.uncategorized')
  const postAuthor = post.productHandeledBy || post.author || t('drawer.unknownAuthor')
  const postDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : post.dateAdded
      ? new Date(post.dateAdded.toString()).toLocaleDateString()
      : t('drawer.unknownDate')
  const country = post.country || t('drawer.international')
  const numPrice = typeof post.price === 'string'
    ? parseFloat(post.price)
    : post.price
  const currency = post.currency || 'USD'

  return (
    <>
      <style jsx global>{`
        /* Ensure drawer overlays don't block elements with higher z-index */
        [data-type="overlay"] {
          pointer-events: none !important;
          z-index: 948 !important; /* Lower than drawer content */
        }
        .drawer-content-right {
          pointer-events: auto !important;
        }
      `}</style>
      
      <Drawer 
        open={isOpen} 
        onOpenChange={onOpenChange} 
        direction="right"
        shouldScaleBackground={false}
      >
        <DrawerContent className="drawer-content-right">
          <div className="h-full flex flex-col">
            <DrawerHeader className="border-b border-violet-100">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-xl font-bold">{postTitle}</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
              <DrawerDescription className="mt-2">
                <span className="max-w-xs">
                  <Badge
                    variant="outline"
                    className="border-violet-200 text-violet-700 bg-violet-50 break-words whitespace-normal line-clamp-3 max-w-full"
                  >
                    {postCategory}
                  </Badge>
                </span>

                <span className="flex items-center text-sm text-muted-foreground mt-2">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{t('product.authorPrefix')}{postAuthor}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{postDate}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Globe className="h-4 w-4 mr-1" /> {country}
                  </span>
                </span>
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-auto p-4">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-fuchsia-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency,
                      }).format(numPrice)}
                    </h3>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= (post.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({post.views || 0} {t('product.viewsSuffix')})
                      </span>
                    </div>
                  </div>

                  {post.domainAuthority && (
                    <div className="flex flex-col items-center justify-center bg-violet-50 p-3 rounded-lg">
                      <span className="text-xl font-bold text-violet-700">{post.domainAuthority}</span>
                      <span className="text-xs text-violet-600">{t('product.da')}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 text-gray-700">
                  <p className="text-muted-foreground">
                    {t('drawer.premiumDescription', { category: postCategory })}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-violet-50 p-3 rounded-lg flex items-center">
                      <div className="bg-violet-200 p-2 rounded-full mr-3">
                        <Star className="h-4 w-4 text-violet-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('drawer.domainRating')}</p>
                        <p className="text-lg font-bold text-violet-700">{post.domainRatings || t('product.notAvailable')}</p>
                      </div>
                    </div>

                    <div className="bg-violet-50 p-3 rounded-lg flex items-center">
                      <div className="bg-violet-200 p-2 rounded-full mr-3">
                        <Eye className="h-4 w-4 text-violet-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('drawer.monthlyTraffic')}</p>
                        <p className="text-lg font-bold text-violet-700">
                          {post.monthlyTraffic ? new Intl.NumberFormat().format(post.monthlyTraffic) : t('product.notAvailable')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {post.sampleLink && (
                    <p className="text-sm text-muted-foreground">
                      <strong>{t('drawer.sampleLink')}:</strong>{" "}
                      <a
                        href={post.sampleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:underline"
                      >
                        {t('drawer.viewSample')}
                      </a>
                    </p>
                  )}

                  {post.websiteUrl && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Website URL:</strong>{" "}
                      <a
                        href={post.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </p>
                  )}
                  {post.adjustedPrice !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Adjusted Price:</strong> €{post.adjustedPrice}
                    </p>
                  )}

                  <h4 className="font-medium mt-4">What's included:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {post.domainAuthority && (
                      <li>Publication on a domain with DA {post.domainAuthority}</li>
                    )}
                    {post.linkType && (
                      <li>
                        {t('drawer.backlink', { 
                          type: post.linkType === "doFollow" 
                            ? t('drawer.doFollow') 
                            : t('drawer.noFollow')
                        })}
                      </li>
                    )}               
                    {post.maxLinkAllowed && <li>{post.maxLinkAllowed} links allowed</li>}
                    {post.Wordlimit && <li>Word limit: {post.Wordlimit} words</li>}
                    {post.turnAroundTime && <li>Turnaround time: {post.turnAroundTime} days</li>}
                    {post.liveTime && <li>Live time: {post.liveTime}</li>}
                  </ul>

                  <h4 className="font-medium mt-4">{t('drawer.requirements')}</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>
                      Original content only{" "}
                      {post.Wordlimit}
                    </li>
                    <li>{t('drawer.topicRelevance', { category: postCategory })}</li>
                  </ul>

                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-violet-100">
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('drawer.addingToCart')}
                  </>
                ) : t('product.add_to_cart')}
              </Button>

              {post.websiteUrl && (
                <Button
                  variant="outline"
                  className="w-full border-violet-200 hover:bg-violet-50 py-6 mb-4"
                  onClick={() => window.open(post.websiteUrl, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('drawer.visitSite')}
                </Button>
              )}

            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Authentication Modal - Use translations */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md z-[1040]">
          <DialogHeader>
            {/* Use translation for title */}
            <DialogTitle className="text-center">{t('authModal.title')}</DialogTitle>
            {/* Use translation for header description */}
            <DialogDescription className="text-center">
              {t('authModal.headerDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-violet-100 p-4 mb-4">
              <LogIn className="h-6 w-6 text-violet-600" />
            </div>
            {/* Use translation for main description */}
            <p className="text-muted-foreground mb-4">
              {t('authModal.description')}
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            {/* Login button already uses tNav */}
            <Button
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
              onClick={handleLoginRedirect}
            >
              {tNav('login')}
            </Button>
            {/* Use translation for Cancel button */}
            <Button variant="outline" onClick={() => setShowAuthModal(false)}>
              {t('authModal.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

