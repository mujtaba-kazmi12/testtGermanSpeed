import Cookies from "js-cookie";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const addToCart = async (productIds: string[]): Promise<{ success: boolean; message: string; id?: string }> => {
  try {
    const userId = Cookies.get("userId");
    if (!userId) throw new Error("User not authenticated");

    const payload = {
      userId,
      products: productIds.map((productId) => ({ productId })),
    };

    const response = await fetch(`${API_BASE_URL}/v1/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const isError =
      !response.ok ||
      data.message?.includes("already added") ||
      data.message?.includes("error") ||
      data.error;

    const cartId = data?.data?.id || undefined;
    if (cartId) Cookies.set("cart_id", cartId, { expires: 7 });

    return {
      success: !isError,
      message: data.message || (isError ? "Failed to add to cart" : "Products added to cart"),
      id: cartId,
    };
  } catch (error) {
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
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

    const data = await response.json();
    if (!data || data.message === "Cart not found or access denied") {
      setError("Cart not found or access denied.");
      return undefined;
    }
    return data;
  } catch (error) {
    setError("Unexpected error occurred");
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
      return { message: "Invalid or expired token" };
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to remove item.");
      return data;
    }

    return data;
  } catch (error) {
    setError("Unexpected error occurred. Please try again.");
    return { message: "Unexpected error" };
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
      return undefined;
    }
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message || "Failed to delete cart.");
      return response;
    }
    return response;
  } catch (error) {
    setError("Unexpected error occurred. Please try again.");
    return undefined;
  }
};









