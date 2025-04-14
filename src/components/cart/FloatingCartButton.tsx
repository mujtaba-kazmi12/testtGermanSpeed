"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { CartIndicator } from "./CartIndicator";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FloatingCartButtonProps {
  className?: string;
}

export function FloatingCartButton({ className }: FloatingCartButtonProps) {
  const t = useTranslations("cart");
  const { cartCount, isCartOpen, setIsCartOpen, cartItems } = useCart();
  const { trackClick, trackClickCart } = useAnalytics();
  const isLoggedIn = !!Cookies.get("token");
  const userRole = Cookies.get("role");
  const isRegularUser = isLoggedIn && userRole === "user";
  const prevCartCount = useRef(cartCount);
  const [shouldBounce, setShouldBounce] = useState(false);

  // Detect cart count changes to trigger bounce
  useEffect(() => {
    if (cartCount > prevCartCount.current && cartCount > 0) {
      setShouldBounce(true);
      const timer = setTimeout(() => setShouldBounce(false), 600);
      return () => clearTimeout(timer);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const handleCartClick = () => {
    setIsCartOpen(true);
    
    // Track the simple click event (REMOVED - Only firing view_cart below)
    // trackClick("floating_cart_click", "Clicked Floating Cart Icon", "click");

    // Check user role first
    if (isLoggedIn && userRole !== "user") {
      toast.error(t('toast.cartClickRoleErrorTitle'), {
        description: t('toast.cartClickRoleErrorDesc'),
        duration: 5000,
      });
      // Don't track view_cart for non-users
      return; 
    }

    // --- ADD VIEW_CART ECOMMERCE TRACKING HERE --- 
    // Check conditions and fire tracking directly on click
    if (isRegularUser && cartItems.length > 0) {
      // Map cart items to STANDARD GA4 ecommerce format
      const mappedItems = cartItems.map(item => ({
        item_id: item.id,
        item_name: item.siteName || item.title || "Untitled Product",
        item_category: Array.isArray(item.category) ? item.category.join(", ") : (item.category || "Uncategorized"),
        price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.adjustedPrice === 'string' ? parseFloat(item.adjustedPrice) : item.price || 0),
        quantity: 1, // Assuming quantity is 1
      }));

      console.log(`%c>>> FIRING view_cart from FloatingCartButton (Standard Params)`, 'color: blue; font-weight: bold;', mappedItems);
      // Use trackClickCart to send the view_cart ecommerce event
      trackClickCart('view_cart', "EUR", mappedItems);
    }
    // --- END VIEW_CART ECOMMERCE TRACKING --- 
  };

  // Define animations
  const floatingAnimation = {
    y: ["0%", "-40%", "0%"],
    transition: {
      y: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      }
    }
  };

  const bounceAnimation = {
    y: ["0%", "-15%", "0%", "-10%", "0%", "-5%", "0%"],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  };

  return (
    <>
      <style jsx global>{`
        /* Ensure floating cart is clickable even with overlays */
        .floating-cart-button {
          pointer-events: auto !important;
          isolation: isolate;
        }
        
        /* Target ShadCN drawer overlay specifically */
        [role="dialog"] {
          pointer-events: none !important;
        }
        
        [role="dialog"] > * {
          pointer-events: auto !important;
        }
        
        /* Make drawer overlays not block the floating cart button */
        [data-type="overlay"] {
          pointer-events: none !important;
        }
      `}</style>
      
      <AnimatePresence>
        {!isCartOpen && (
          <motion.div 
            className={`fixed top-1/2 -translate-y-1/2 right-6 z-[1050] floating-cart-button ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: "auto" }}
            onClick={(e) => {
              e.stopPropagation();
              handleCartClick();
            }}
          >
            <motion.button
              animate={shouldBounce ? bounceAnimation : floatingAnimation}
              aria-label={t('ariaLabel')}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && isRegularUser && (
                <Badge className="absolute -top-1 -right-1 bg-white text-fuchsia-600 text-xs min-w-5 h-5 flex items-center justify-center rounded-full px-1 border border-fuchsia-600">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer controlled by the floating button */}
      <CartIndicator isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
} 