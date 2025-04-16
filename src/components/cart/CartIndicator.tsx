"use client"

import { useState, useEffect, useRef } from "react"
// import { useCart } from "@/app/GlobalStore/CartProviderContext"
import { useCart } from "@/context/CartContext"
import { ShoppingCart, X, LogIn, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { useRouter, useParams } from "next/navigation"
import { getCartApi, deleteCartApi } from "@/app/[locale]/Services/CartService"
// import { ErrorPopup } from "@/app/components/ErrorPopup"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { toast } from "sonner"
import { Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useAnalytics } from "@/hooks/useAnalytics";
// Custom animation styles similar to post-drawer
const customStyles = `
  .cart-drawer-right {
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    max-width: 500px !important;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1) !important;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    z-index: 1000 !important;
    will-change: transform;
  }

  .cart-drawer-right[data-state="open"] {
    transform: translateX(0);
  }

  .cart-drawer-right[data-state="closed"] {
    transform: translateX(100%);
  }
`

interface CartIndicatorProps {
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartIndicator({ className, isOpen: externalIsOpen, onOpenChange }: CartIndicatorProps) {
  const t = useTranslations('cart');
  const tNav = useTranslations('navigation');
  const { 
    cartCount, 
    loading: contextLoading, 
    refreshCart, 
    cartItems: contextCartItems,
    isCartOpen: contextIsOpen,
    setIsCartOpen: contextSetIsOpen
  } = useCart();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();
  const { locale } = useParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isLoggedIn = !!Cookies.get("token");
  const userRole = Cookies.get("role");
  const isRegularUser = isLoggedIn && userRole === "user";
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const getCookie = (name: string) => Cookies.get(name) || null;
  // Add a state to track if we've loaded cart data at least once
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  // Add a state to track items being deleted
  const [itemsBeingDeleted, setItemsBeingDeleted] = useState<string[]>([]);
  const { trackClickCart } = useAnalytics();
  
  // Determine if drawer is controlled externally, by context, or internally
  const isExternallyControlled = externalIsOpen !== undefined && onOpenChange !== undefined;
  const isContextControlled = !isExternallyControlled;
  
  // Use the appropriate open state and setter based on control mode
  const isOpen = isExternallyControlled ? externalIsOpen : contextIsOpen;
  const setIsOpen = (open: boolean) => {
    if (isExternallyControlled) {
      onOpenChange(open);
    } else {
      contextSetIsOpen(open);
    }
  };
  
  // Update local cart items when context cart items change
  useEffect(() => {
    if (contextCartItems && contextCartItems.length > 0) {
      console.log("Updating local cart items from context:", contextCartItems.length);
      setCartItems(contextCartItems);
      
      // Calculate total amount from context cart items
      const newTotal = contextCartItems.reduce(
        (sum: number, item: any) => sum + Number(item.adjustedPrice || item.price || 0), 
        0
      );
      setTotalAmount(newTotal);
    } else if (contextCartItems) {
      // If contextCartItems is empty but defined, update local state
      setCartItems([]);
      setTotalAmount(0);
    }
  }, [contextCartItems]);
  
  // Style setup
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = customStyles
    document.head.appendChild(styleElement)
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Fetch cart data on initial mount, not just when drawer opens
  useEffect(() => {
    if (isRegularUser) {
      console.log("Initial cart data fetch");
      // Ensure loading state is properly managed
      const initialFetch = async () => {
        try {
          await refreshCart();
          // Mark that we've loaded once after the initial fetch
          setHasLoadedOnce(true);
        } catch (err) {
          console.error("Error in initial cart fetch:", err);
          setHasLoadedOnce(true); // Still mark as loaded to avoid perpetual loading state
        } finally {
          // Make absolutely sure loading is false after initial fetch
          setLocalLoading(false);
        }
      };
      initialFetch();
    }
  }, [isRegularUser]);

  // Effect for handling drawer opening (REMOVED view_cart tracking)
  useEffect(() => {
    if (isOpen) {
      // Fetch data when drawer opens (this can stay as is)
      if (isRegularUser) {
        console.log("Refreshing cart data on drawer open...");
        const refreshOnOpen = async () => {
          try {
            await fetchCartData();
          } catch (err) {
            console.error("Error refreshing cart on drawer open:", err);
          }
        };
        refreshOnOpen();
      }

      // --- VIEW_CART TRACKING REMOVED FROM HERE --- 

    }

    // Cleanup function (if any specific to fetching is needed, otherwise can be removed if only tracking was here)
    // return () => { ... };
    
  // Dependencies likely only need isOpen, isRegularUser, fetchCartData now
  // }, [isOpen, isRegularUser, fetchCartData]); // Removed cartItems, trackClickCart if only used for tracking
  // Reverted dependencies for now, review if fetchCartData needs them
  }, [isOpen, isRegularUser, cartItems, trackClickCart]); 

  const fetchCartData = async () => {
    if (!isRegularUser) return;
    
    // Only show loading if we haven't loaded data before and no items exist
    if (!hasLoadedOnce && cartItems.length === 0) {
      setLocalLoading(true);
    }
    
    // Safety timeout - force loading to false after 5 seconds if it gets stuck
    const safetyTimeout = setTimeout(() => {
      console.log("Safety timeout triggered - resetting loading state");
      setLocalLoading(false);
    }, 5000);
    
    try {
      // Directly fetch from API instead of using refreshCart to avoid potential issues
      const userId = getCookie("userId");
      if (!userId) {
        setLocalLoading(false);
        clearTimeout(safetyTimeout);
        return;
      }
      
      console.log("Fetching cart data directly for userId:", userId);
      const responseData = await getCartApi(userId, setErrorMessage);
      
      if (!responseData || !responseData.data) {
        setLocalLoading(false);
        clearTimeout(safetyTimeout);
        return;
      }
      
      // Process the response
      const carts = Array.isArray(responseData.data) ? responseData.data : [];
      const userCart = carts.find((cart: any) => String(cart.user?.id) === String(userId));
      
      if (userCart && userCart.products && userCart.products.length > 0) {
        // Filter out any products that are currently being deleted
        const filteredProducts = userCart.products.filter((item: any) => 
          !itemsBeingDeleted.includes(item.id)
        );
        
        if (filteredProducts.length > 0) {
          const cartProducts = filteredProducts.map((item: any) => ({
            ...item,
            productId: item.id,
          }));
          
          console.log("Cart Products directly fetched:", cartProducts.length, "filtered out deleted items:", itemsBeingDeleted);
          
          // Check if the cart content has actually changed before updating state
          // Use a more reliable method to compare cart items - stringify and then compare
          const currentItems = JSON.stringify(cartItems.map((item: any) => item.id).sort());
          const newItems = JSON.stringify(cartProducts.map((item: any) => item.id).sort());
          
          if (currentItems !== newItems) {
            console.log("Cart content has changed, updating UI");
            setCartItems(cartProducts);
            
            const newTotal = cartProducts.reduce(
              (sum: number, item: any) => sum + Number(item.adjustedPrice || item.price || 0), 
              0
            );
            setTotalAmount(newTotal);
          } else {
            console.log("Cart content unchanged, not updating UI");
          }
        } else if (cartItems.length > 0) {
          // Only clear cart if we had items before and now have none
          console.log("No products after filtering, clearing cart");
          setCartItems([]);
          setTotalAmount(0);
        }
      } else if (cartItems.length > 0) {
        // Only clear cart if we had items before and now have none
        console.log("No products in API response, clearing cart");
        setCartItems([]);
        setTotalAmount(0);
      }
      
      // Mark that we've loaded data at least once
      setHasLoadedOnce(true);
      
    } catch (error) {
      console.error("Error fetching cart data:", error);
      // Only clear cart on error if we're not in the middle of deleting items
      if (itemsBeingDeleted.length === 0 && cartItems.length > 0) {
        setCartItems([]);
        setTotalAmount(0);
      }
    } finally {
      // Ensure loading is always set to false after every operation
      setLocalLoading(false);
      console.log("Cart fetch completed, localLoading set to false");
      clearTimeout(safetyTimeout);
    }
  };

  const removeItem = async (productId: string) => {
    if (!isRegularUser) {
      toast.error(t('toast.removeItemRoleError'));
      return;
    }
    
    // Don't set loading here, as it will cause re-renders
    // setLocalLoading(true);
    
    // Add the item to the list of items being deleted
    setItemsBeingDeleted(prev => [...prev, productId]);
    
    // Optimistically update local cart items first for instant feedback
    setCartItems(prev => prev.filter(item => item.id !== productId));
    
    // Calculate new total amount after removing the item
    const removedItem = cartItems.find(item => item.id === productId);
    if (removedItem) {
      const itemPrice = Number(removedItem.adjustedPrice || removedItem.price || 0);
      setTotalAmount(prevTotal => prevTotal - itemPrice);
    }
    
    try {
      const data = await deleteCartApi(productId, setErrorMessage); // Already returns JSON
  
      if (!data) {
        // Handle error case - don't use setLocalLoading
        toast.error(t('toast.removeErrorTitle'));
        // Remove from being deleted list
        setItemsBeingDeleted(prev => prev.filter(id => id !== productId));
        // Fetch cart again to restore state
        fetchCartData();
        return;
      }
  
      // ✅ Handle session expiration error
      if (data.message === "Invalid or expired token") {
        setErrorMessage("Please login first");
        toast.error(t('toast.sessionExpiredTitle'), { description: t('toast.sessionExpiredDesc') });
  
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
        setItemsBeingDeleted(prev => prev.filter(id => id !== productId));
        return;
      }
      
      // Show success toast
      toast.success(t('toast.removeSuccessTitle'), { description: t('toast.removeSuccessDesc') });
      
      // After success, trigger a refresh in the background to update cart state
      // But don't wait for it and don't show loading indicators
      setTimeout(() => {
        refreshCart();
      }, 500);
      
    } catch (error) {
      console.error("Error removing item:", error);
      setErrorMessage(t('toast.removeErrorDesc'));
      toast.error(t('toast.removeErrorTitle'), { description: t('toast.removeErrorDesc') });
      
      // Restore the removed item in case of error
      fetchCartData();
    } finally {
      // Remove the item from the list of items being deleted
      setItemsBeingDeleted(prev => prev.filter(id => id !== productId));
    }
  };
  
  const handleLogin = () => {
    setIsOpen(false);
    // Delay navigation until the drawer closing animation (300ms) completes
    setTimeout(() => {
      router.push("/sign-in");
    }, 300); 
  }
 
  const handleCheckout = () => {
    if (!isRegularUser) {
      toast.error(t('toast.removeItemRoleError'));
      return;
    }
    
    setIsOpen(false)

    // Calculate total amount from cart items
    const total = cartItems.reduce((sum, item) => sum + Number(item.adjustedPrice || item.price || 0), 0)

    // Create query parameters with total amount and cart items
    const queryParams = new URLSearchParams()
    queryParams.append("total", total.toString())

    // Add cart item IDs as a JSON string
    const productIds = cartItems.map((item) => item.id)
    queryParams.append("cartItems", JSON.stringify(productIds))
    
    router.push(`/checkout?${queryParams.toString()}`)
  }

  const handleCartClick = () => {
    setIsOpen(true);
    
    // Check user role first
    if (isLoggedIn && userRole !== "user") {
      toast.error(t('toast.cartClickRoleErrorTitle'), {
        description: t('toast.cartClickRoleErrorDesc'),
        duration: 5000,
      });
      // Potentially return early if non-users shouldn't trigger view_cart
      // return; 
    }

    // --- UPDATED VIEW_CART TRACKING --- 
    // Check conditions and fire tracking directly on click
    if (isRegularUser && cartItems.length > 0) {
      // Map cart items to the desired GA4 ecommerce format
      const mappedItems = cartItems.map(item => ({
        item_id: item.id,
        item_name: item.siteName || item.title || "Untitled Product",
        item_category: Array.isArray(item.category) ? item.category.join(", ") : (item.category || "Uncategorized"),
        price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.adjustedPrice === 'string' ? parseFloat(item.adjustedPrice) : item.price || 0),
        quantity: 1,
        domain_authority: item.domainAuthority || item.da || 0,
        domain_rating: item.domainRatings || item.dr || 0,
        monthly_traffic: item.monthlyTraffic || 0,
        language: item.language || ""
      }));

      // Calculate total value
      const totalValue = mappedItems.reduce((sum, item) => sum + (item.price || 0), 0);

      // Clear previous ecommerce object
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({ ecommerce: null });
        
        // Push view_cart event with simplified structure
        window.dataLayer.push({
          event: "view_cart",
          ecommerce: {
            currency: "EUR",
            value: totalValue,
            items: mappedItems
          }
        });
        
        console.log(`%c>>> FIRING view_cart with optimized structure:`, 'color: blue; font-weight: bold;', mappedItems);
      }
    }
    // --- END VIEW_CART TRACKING --- 
  }

  // Cart loading state - use local loading state instead of context loading
  const isCartLoading = localLoading;
  
  // Debug log - remove after fixing
  console.log("Cart Drawer Debug - localLoading:", localLoading, "contextLoading:", contextLoading, "cartItems:", cartItems.length);

  return (
    <>
      {/* Only show the button when not controlled externally */}
      {!isExternallyControlled && (
        <div className={`relative ${className}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCartClick}
            className="rounded-full p-2 hover:bg-violet-100 shadow-md bg-white"
            aria-label={t('ariaLabel')}
          >
            <ShoppingCart className="h-5 w-5 text-violet-600" />
            {cartCount > 0 && isRegularUser && (
              <Badge className="absolute -top-1 -right-1 bg-fuchsia-600 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full px-1">
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </Button>
        </div>
      )}
  
      {/* Cart Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
        <DrawerContent className="cart-drawer-right">
          <div className="h-full flex flex-col">
            <DrawerHeader className="border-b border-violet-100">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-xl font-bold">{t('title')}</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
  
            <div className="flex-1 overflow-y-auto">
              {!hasLoadedOnce && isCartLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin h-8 w-8 text-violet-600" />
                </div>
              ) : isLoggedIn ? (
                userRole !== "user" ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="rounded-full bg-slate-100 p-3 mb-4">
                      <ShoppingCart className="h-6 w-6 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold">{t('unavailable.title')}</h3>
                    <p className="text-muted-foreground mt-2">
                      {t('unavailable.description')}
                    </p>
                  </div>
                ) : cartItems.length > 0 ? (
                  <div className="p-4">
                    {/* Log items for debugging */}
                    {(() => { console.log("Rendering cartItems in drawer:", cartItems); return null; })()}
                    {cartItems.map((item, index) => (
                      <div key={item.id || index} className="mb-4 p-4 border-b border-violet-100">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-semibold">{item.siteName}</h3>
                          <span className="font-bold">€{item.adjustedPrice || item.price}</span>
                        </div>
  
                        <div className="text-sm text-muted-foreground mb-2">
                          <a
                            href={item.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 hover:underline"
                          >
                            {item.websiteUrl}
                          </a>
                        </div>
  
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                          {item.country && (
                            <span className="bg-violet-50 px-2 py-1 rounded-full">{t('item.countryLabel', { country: item.country })}</span>
                          )}
                          {item.linkType && (
                            <span className="bg-violet-50 px-2 py-1 rounded-full">{t('item.typeLabel', { type: item.linkType })}</span>
                          )}
                          {item.monthlyTraffic && (
                            <span className="bg-violet-50 px-2 py-1 rounded-full">{t('item.trafficLabel', { traffic: item.monthlyTraffic })}</span>
                          )}
                        </div>
  
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t('item.removeButton')}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="rounded-full bg-slate-100 p-3 mb-4">
                      <ShoppingCart className="h-6 w-6 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
                    <p className="text-muted-foreground mt-2">
                      {t('empty.description')}
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="rounded-full bg-slate-100 p-3">
                    <LogIn className="h-6 w-6 text-violet-600" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <h3 className="text-lg font-semibold">{t('loginRequired.title')}</h3>
                    <p className="text-muted-foreground">
                      {t('loginRequired.description')}
                    </p>
                  </div>
                  <Button
                    className="mt-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                    onClick={handleLogin}
                  >
                    {tNav('login')}
                  </Button>
                </div>
              )}
            </div>
  
            <DrawerFooter className="border-t border-violet-100">
              {isRegularUser && cartItems.length > 0 && (
                <div className="w-full space-y-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{t('footer.totalLabel')}</span>
                    <span>€{totalAmount}</span>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    onClick={handleCheckout}
                  >
                    {t('footer.checkoutButton')}
                  </Button>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                {t('footer.closeButton')}
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

