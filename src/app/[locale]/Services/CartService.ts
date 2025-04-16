import Cookies from "js-cookie";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const addToCart = async (productIds: string[]): Promise<{ success: boolean; message: string; id?: string }> => {
  try {
    const userId = Cookies.get("userId"); // Get user ID from cookies
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const payload = {
      userId,
      products: productIds.map((productId) => ({ productId })),
    };

    const response = await fetch(`${API_BASE_URL}/v1/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const isError =
      !response.ok ||
      data.message?.includes("already added") ||
      data.message?.includes("error") ||
      data.error;

    // Extract cart ID
    const cartId = data?.data?.id || undefined;

    // Store cart ID in cookies (if available)
    if (cartId) {
      Cookies.set("cart_id", cartId, { expires: 7 }); // Expires in 7 days
      console.log("Cart ID stored in cookies:", cartId);
    }

    console.log("Add to cart response:", data);

    return {
      success: !isError,
      message: data.message || (isError ? "Failed to add to cart" : "Products added to cart"),
      id: cartId, // Return cart ID
    };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add to cart",
    };
  }
};
export const getCartApi = async (
  userId: string,
  setError: (error: string) => void
): Promise<any | undefined> => {
  try {
    const url = `${API_BASE_URL}/v1/cart/${userId}`;
    console.log("Request URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data || data.message === "Cart not found or access denied") {
      setError("Cart not found or access denied.");
      return undefined;
    }

    return data;
  } catch (error) {
    setError("Unexpected error occurred");
    console.error("Fetch Cart Error:", error);
    return undefined;
  }
};
export const deleteCartApi = async (
  productId: string,
  setError: (error: string) => void
): Promise<any | undefined> => {
  try {
    const url = `${API_BASE_URL}/v1/cart/productId/${productId}`;
    const authToken = Cookies.get("token");

    if (!authToken) {
      setError("User is not authenticated.");
      console.error("[DELETE CART] Auth token missing.");
      return { message: "Invalid or expired token" }; // Return error message
    }

   

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[DELETE CART] Response Status:", response.status);
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to remove item.");
      console.error("[DELETE CART] API Error:", data);
      return data; // Return data instead of Response object
    }

    console.log("[DELETE CART] Item deleted successfully");
    return data; // Return successful API response
  } catch (error) {
    setError("Unexpected error occurred. Please try again.");
    console.error("[DELETE CART] Unexpected error:", error);
    return { message: "Unexpected error" }; // Return error object
  }
};
export const deleteCartByIdApi = async (
  cartId: string,
  setError: (error: string) => void
): Promise<Response | undefined> => {
  try {
    const url = `${API_BASE_URL}/v1/cart/cardId/${cartId}`;
    const authToken = Cookies.get("token");
    if (!authToken) {
      setError("User is not authenticated.");
      console.error("Auth token missing.");
      return undefined;
    }
    console.log("DELETE Request URL:", url);
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message || "Failed to delete cart.");
      console.error("Delete Cart API error:", errorData);
      return response;
    }
    console.log("Cart deleted successfully");
    return response;
  } catch (error) {
    setError("Unexpected error occurred. Please try again.");
    console.error("Unexpected error:", error);
    return undefined;
  }
};









