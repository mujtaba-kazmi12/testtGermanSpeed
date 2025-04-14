import Cookies from "js-cookie";
import { GetProfileResponse,UpdateProfileResponse,UpdateProfileRequestBody } from "@/types/ProfileType";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getProfile = async (
  setError: (error: string) => void
): Promise<GetProfileResponse | undefined> => {
  try {
    const token = Cookies.get("token");

    if (!token) {
      setError("User is not authenticated");
      return undefined;
    }
    const response = await fetch(`${API_BASE_URL}/v1/auth/get-profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText || "Unauthorized access");
    }

    return await response.json();
  } catch (error) {
    const err = error as Error;
    setError(err.message || "Unexpected error occurred");
    return undefined;
  }
};

export const updateProfile = async (
  body: UpdateProfileRequestBody,
  setError: (error: string) => void
): Promise<UpdateProfileResponse | undefined> => {
  try {
    const token = Cookies.get("token");

    if (!token) {
      setError("User is not authenticated");
      return undefined;
    }
    const response = await fetch(`${API_BASE_URL}/v1/auth/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  }catch (error) {
    const err = error as Error;
    setError(err.message || "Unexpected error occurred");
    return undefined;
  }
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      console.error("No auth token found");
      return { error: "No auth token found" };
    }
    const response = await fetch(`${API_BASE_URL}/v1/auth/update-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error updating password:", errorData.message);
      return { error: errorData.message };
    }

    return await response.json();
  } catch (error) {
    console.error("Unexpected error occurred while updating password");
    return { error: "An unexpected error occurred." };
  }
};
