import { AxiosResponse, isAxiosError } from "axios";
import axiosInstance from "../Settings/axios.config";
import { CheckOutApiResponse } from "@/types/checkout";
export const handleOrderRequest = async (
  setError: (error: string) => void,
  token: string,
  requestData: {
    firstName: string;
    lastName: string;
    country: string;
    city: string;
    postalCode: string;
    phoneNo: string;
    email: string;
    anchorLink: string;
    anchor: string;
    wordLimit: string; // Changed from `string` to `number` as per `wordLimitAsNumber`
    network: string;
    to_currency: string;
    products: { productId: string }[];
  }
): Promise<AxiosResponse<CheckOutApiResponse> | undefined> => {
  try {
    const response: AxiosResponse<CheckOutApiResponse> = await axiosInstance.post(
      "/order/conten-provider",
      requestData, // ✅ Object directly pass karna
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      setError(error.response.statusText);
      return error.response as AxiosResponse<CheckOutApiResponse>;
    }
    setError("Unexpected error occurred");
    return undefined;
  }
};

