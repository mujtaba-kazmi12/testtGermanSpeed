import { AxiosResponse, isAxiosError } from "axios";
import axiosInstance from "../Settings/axios.config";
import { OrdersApiResponse } from "@/types/checkout";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const OrderData = async (
  setError: (error: string) => void,
  page: number,  // Page parameter
  limit: number  // Limit parameter
): Promise<AxiosResponse<OrdersApiResponse> | undefined> => {
  try {
    const token = Cookies.get("token"); // Get token from cookies

    if (!token) {
      setError("User is not authenticated");
      return undefined;
    }

    const response: AxiosResponse<OrdersApiResponse> = await axiosInstance.get(
      `${API_BASE_URL}/v1/order`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,  // Query parameters
          limit,
        },
      }
    );
    return response;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      setError(error.response.statusText);
      return error.response as AxiosResponse<OrdersApiResponse>;
    }
    setError("Unexpected error occurred");
    return undefined;
  }
};
