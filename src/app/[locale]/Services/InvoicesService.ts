import { AxiosResponse, isAxiosError } from "axios";
import axiosInstance from "../Settings/axios.config";
import { GetInvoicesResponse } from "@/types/InvoicesType";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getInvoices = async (
  setError: (error: string) => void,
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ""
): Promise<GetInvoicesResponse | undefined> => {
  try {
    const token = Cookies.get("token"); // Get token from cookies

    if (!token) {
      setError("User is not authenticated");
      return undefined;
    }

    // ✅ Construct API URL based on search query
    let apiUrl = `${API_BASE_URL}/v1/orderInvocie?page=${page}&limit=${limit}`;
    if (searchQuery) {
      apiUrl += `&q=${searchQuery}`;
    }

    const response: AxiosResponse<GetInvoicesResponse> = await axiosInstance.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // ✅ Extracting invoices array

  } catch (error) {
    if (isAxiosError(error) && error.response) {
      setError(error.response.statusText || "Unauthorized access");
    } else {
      setError("Unexpected error occurred");
    }
    return undefined;
  }
};
