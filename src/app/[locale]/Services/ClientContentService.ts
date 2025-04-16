import axios, { AxiosResponse, isAxiosError } from "axios";
import axiosInstance from "../Settings/axios.config";
import { ClientContentApiResponse } from "@/types/ClientContentType";

export const checkPaymentStatus = async (
  uuid: string,
  orderId: string,
  setError: (error: string) => void
): Promise<AxiosResponse<any> | undefined> => {
  try {
    const response = await axios.get(
      `https://backend.crective.com/payscrap/check_payment_status?uuid=${uuid}&order_id=${orderId}`,
      {
        headers: {
          Authorization: "halwapuri",
        },
      }
    );
    return response;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      setError(error.response.statusText);
      return error.response;
    }
    setError("Unexpected error occurred");
    return undefined;
  }
};

export const fetchPaymentServices = async (
  setError: (error: string) => void
): Promise<AxiosResponse<any> | undefined> => {
  try {
    const response = await axios.get(
      "https://backend.crective.com/payscrap/services",
      {
        headers: {
          Authorization: "halwapuri",
        },
      }
    );
    return response;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      setError(error.response.statusText);
      return error.response;
    }
    setError("Unexpected error occurred");
    return undefined;
  }
};

export const handleClientOrderRequest = async (
  setError: (error: string) => void,
  token: string,
  requestData: {
    email: string;
    backupEmail: string;
    notes: string;
    firstName: string;
    lastName: string;
    postalCode: string;
    city: string;
    country: string;
    phoneNo: string;
    file: string;
    network: string;
    to_currency: string;
    products: { productId: string }[];
  }
): Promise<AxiosResponse<ClientContentApiResponse> | undefined> => {
  try {
    const response = await axiosInstance.post<ClientContentApiResponse>(
      "/order",
      requestData,
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
      return error.response;
    }
    setError("Unexpected error occurred");
    return undefined;
  }
};

export const handleFileUpload = async (
  setError: (error: string) => void,
  token: string,
  file: File
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    setError(`File upload failed. ${String(error)}`);
    return undefined;
  }
};
