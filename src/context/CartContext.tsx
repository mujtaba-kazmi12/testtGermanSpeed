"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types/Table";
import { addToCart as addToCartService, getCartApi, deleteCartByIdApi } from "@/app/[locale]/Services/CartService";

// Define the shape of our cart context
interface CartContextType {
  cartItems: Product[];
  cartCount: number;
  loading: boolean;
  error: string | null;
  addToCart: (product: Product) => Promise<{ success: boolean; message: string; id?: string }>;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  deleteCart: () => Promise<void>; // New function to clear the cart from API
  isCartOpen: boolean; // Add isCartOpen state
  setIsCartOpen: (isOpen: boolean) => void; // Add setter for isCartOpen
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component that wraps your app and makes cart context available
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false); // Add isCartOpen state

  // Load cart data on initial mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Function to refresh cart data from API
  const refreshCart = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get userId from cookies - more reliable than cart_id
      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
        ?.split("=")[1];

      if (!userId) {
        console.log("No userId found in cookies, can't refresh cart");
        setCartItems([]);
        setLoading(false);
        return;
      }

      console.log("Refreshing cart for userId:", userId);
      const response = await getCartApi(userId, setError);
      
      if (response && response.data) {
        // Check if data is an array of carts
        if (Array.isArray(response.data)) {
          const userCart = response.data.find((cart: any) => String(cart.user?.id) === String(userId));
          
          if (userCart && userCart.products && userCart.products.length > 0) {
            console.log("Found user cart with products:", userCart.products.length);
            // Ensure we're setting the complete product objects
            const productsWithCompleteData = userCart.products.map((product: any) => ({
              ...product,
              id: product.id || product.productId // Ensure id is always set
            }));
            setCartItems(productsWithCompleteData);
            console.log("Cart items updated:", productsWithCompleteData.length);
          } else {
            console.log("No products found in user cart");
            setCartItems([]);
          }
        } 
        // If data.items exists, use it directly (original implementation)
        else if (response.data.items) {
          console.log("Using cart items directly from response");
          const itemsWithIds = response.data.items.map((item: any) => ({
            ...item,
            id: item.id || item.productId // Ensure id is always set
          }));
          setCartItems(itemsWithIds);
          console.log("Cart items updated:", itemsWithIds.length);
        }
        // Check if products array exists directly on data
        else if (response.data.products) {
          console.log("Using products array from response");
          const productsWithIds = response.data.products.map((product: any) => ({
            ...product,
            id: product.id || product.productId // Ensure id is always set
          }));
          setCartItems(productsWithIds);
          console.log("Cart items updated:", productsWithIds.length);
        } else {
          console.log("No recognizable cart data structure found");
          setCartItems([]);
        }
      } else {
        console.log("No response data found, clearing cart items");
        setCartItems([]);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart data");
      // Don't clear cart items on network errors to prevent flickering
      // Only clear if we explicitly know the cart is empty
    } finally {
      setLoading(false);
    }
  };

  // Function to delete the entire cart
  const deleteCart = async () => {
    setLoading(true);
    setError(null);
  
    try {
      
  
      const cartId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("cart_id="))
        ?.split("=")[1];
  
      console.log("🔍 Retrieved cartId from cookies:", cartId);
  
      if (!cartId) {
        setError("❌ Cart ID not found.");
        console.error("❌ Cart ID not found in cookies.");
        return;
      }    
      const response = await deleteCartByIdApi(cartId, setError);
  
      if (response?.ok) {
        console.log("✅ Cart deleted successfully.");
        setCartItems([]); // Clear cart locally
      } else {
        console.error("❌ Failed to delete cart. Response:", response);
        setError("Failed to delete cart.");
      }
    } catch (err) {
      console.error("⛔ Error deleting cart:", err);
      setError("Failed to delete cart.");
    } finally {
      setLoading(false);
      console.log("🔄 Delete cart process completed.");
    }
  };
  

  // Add an item to the cart
  const addToCart = async (product: Product): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await addToCartService([product.id]);
      if (result.success) {
        await refreshCart(); // Refresh cart to get updated items
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      console.error("Error adding item to cart:", err);
      const errorMessage = "Failed to add item to cart";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Remove an item from the cart
  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Clear all items from the cart locally
  const clearCart = () => {
    setCartItems([]);
  };

  // Get the cart count (number of items)
  const cartCount = cartItems.length;

  // Create the value object that will be passed to consumers
  const value = {
    cartItems,
    cartCount,
    loading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart,
    deleteCart, // Expose deleteCart function
    isCartOpen, // Expose isCartOpen state
    setIsCartOpen, // Expose setIsCartOpen function
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook for using the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
