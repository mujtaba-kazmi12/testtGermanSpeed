import { AxiosResponse, isAxiosError } from "axios";
import axiosInstance from "../Settings/axios.config";
import { CheckOutApiResponse } from "@/types/checkout";
import { CountriesApiResponse, CountryCodesApiResponse, UpdateUserInfoRequest, UserInfoResponse } from "@/types/User";
import Cookies from "js-cookie";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import countriesData from "../../../datas/countriesCity.json";

export const OrderPlace = async (
  setError: (error: string) => void, 
  token: string, 
  isContentProvided: boolean, 
  wordLimit: number, 
  backupEmail: string, 
  postLink: string, 
  keyword: string, 
  topic: string, 
  productId: string, 
  totalAmount: number
): Promise<AxiosResponse<CheckOutApiResponse> | undefined> => {
  try {
    const endpoint = `${API_BASE_URL}/orders/place-order`;

    const requestData = {
      Topic: topic,
      keyword,
      postLink,
      email: backupEmail,
      wordLimit,
      totalAmount,
      productId,
    };

    const response: AxiosResponse<CheckOutApiResponse> = await axiosInstance.post(
      endpoint,
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
      return error.response as AxiosResponse<CheckOutApiResponse>;
    }
    setError("Unexpected error occurred");
    return undefined;
  }
};

export const getUserInfo = async (
  setError: (error: string) => void
): Promise<AxiosResponse<UserInfoResponse> | undefined> => {
  const token = Cookies.get("token");
  if (!token) {
    setError("Authentication token not found");
    return undefined;
  }
  try {
    const response: AxiosResponse<UserInfoResponse> = await axiosInstance.get(
      `${API_BASE_URL}/v1/auth/get-profile`,
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
      return error.response as AxiosResponse<UserInfoResponse>;
    }
    setError("Unexpected error occurred while fetching user information");
    return undefined;
  }
};

export const updateUserInfo = async (
  setError: (error: string) => void,
  token: string,
  userData: UpdateUserInfoRequest,
): Promise<AxiosResponse<UserInfoResponse> | undefined> => {
  try {
    const response: AxiosResponse<UserInfoResponse> = await axiosInstance.put(
      `${API_BASE_URL}/v1/order/updateProfile`, 
      userData, 
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
      return error.response as AxiosResponse<UserInfoResponse>;
    }
    setError("Unexpected error occurred while updating user information");
    return undefined;
  }
};


export const fetchCountriesAndCities = async (
  setError: (error: string) => void
): Promise<{ data: CountriesApiResponse } | undefined> => {
  try {
    return { data: countriesData };
  } catch (error) {
    setError("Failed to load countries and cities from local JSON");
    return undefined;
  }
};

export const fetchCountryCodes = async (
  setError: (error: string) => void
): Promise<AxiosResponse<CountryCodesApiResponse> | undefined> => {
  try {
    const response: AxiosResponse<CountryCodesApiResponse> = await axiosInstance.get(
      "https://countriesnow.space/api/v0.1/countries/codes"
    );
    return response;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      setError(error.response.statusText);
      return error.response as AxiosResponse<CountryCodesApiResponse>;
    }
    setError("Failed to fetch country codes");
    return undefined;
  }
};
