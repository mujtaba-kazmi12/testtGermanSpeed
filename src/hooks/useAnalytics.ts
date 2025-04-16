'use client';

import { useCallback } from 'react';
import { ANALYTICS_CONFIG } from '@/lib/analytics-config';
import { useCart } from '@/context/CartContext';



// Define standard GA4 item type (can be refined further)
interface GA4Item {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
  // Add other standard GA4 item params if needed (e.g., item_brand, item_variant)
}

export function useAnalytics() {
  const { GA4_MEASUREMENT_ID } = ANALYTICS_CONFIG;
  const { cartItems } = useCart();


  const trackClick = useCallback(
    (category: string, label: string, action: string = 'click') => {
      // Re-enabled direct gtag call
      if (
        typeof window !== 'undefined' &&
        window.gtag &&
        GA4_MEASUREMENT_ID
      ) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
        });
      }
      

  

      // Log for debugging purposes
      console.log(`Analytics: ${action} - ${category} - ${label}`);
    },
    [GA4_MEASUREMENT_ID]
  );

  // Add trackPageView function for page view events
  const trackPageView = useCallback(
    (url: string) => {
      if (
        typeof window !== 'undefined' &&
        window.gtag &&
        GA4_MEASUREMENT_ID
      ) {
        window.gtag('event', 'page_view', {
          page_location: url,
          page_title: document.title,
        });
      }
      
      // Log for debugging purposes
      console.log(`Analytics Page View: ${url}`);
    },
    [GA4_MEASUREMENT_ID]
  );

  // Add trackClickCart function for cart events - now expects standard GA4 items
  const trackClickCart = useCallback(
    (eventName: string, currency: string, items: GA4Item[]) => {
      // Re-enabled direct gtag call
      if (
        typeof window !== 'undefined' &&
        window.gtag &&
        GA4_MEASUREMENT_ID
      ) {
        // Calculate value from the standard items array
        const totalValue = items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
        
        window.gtag('event', eventName, {
          currency: currency,
          items: items,
          value: totalValue, // Send calculated value
        });
      }
      
      // Log for debugging purposes
      console.log(`Analytics Cart Event: ${eventName}`, items);
    },
    [GA4_MEASUREMENT_ID]
  );

  // Function for tracking checkout events with full implementation
  // This function also needs adjustment if used, as it calls trackClickCart
  const trackClickCartEvent = useCallback((eventName: string = 'begin_checkout', currency: string = 'EUR') => {
    if (!cartItems || cartItems.length === 0) {
      console.log("No cart items available for tracking");
      return;
    }
    
    console.log("🔍 GA trackClickCartEvent - Cart Items from Context:", cartItems);
    
    // Map cart items to the standard GA4 format expected by trackClickCart
    const mappedGA4Items: GA4Item[] = cartItems.map((item: any) => ({
      item_id: item.id,
      item_name: item.siteName || item.title || "",
      item_category: Array.isArray(item.category) ? item.category.join(', ') : (item.category || ""),
      price: typeof item.adjustedPrice === 'string' ? parseFloat(item.adjustedPrice) : (item.adjustedPrice || 0),
      quantity: 1,
      // Map other standard fields if needed
    }));
    
    console.log(`🔍 GA ${eventName} Event - Mapped Standard Items from Context:`, mappedGA4Items);
    
    // Track the event using trackClickCart with standard items
    trackClickCart(eventName, currency, mappedGA4Items);
    
    console.log(`Cart event tracked: ${eventName}`);
    return mappedGA4Items; // Return standard mapped items
  }, [cartItems, trackClickCart]);

  return { trackPageView, trackClick, trackClickCart, trackClickCartEvent };
} 