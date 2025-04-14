import { axiosInstance } from "./api"
import Cookies from "js-cookie"
import type { AxiosResponse } from "axios"
import { CreateProductPayload, CreateProductResponse, SubmitPostingLinkResponse } from "@/types/publisher"
/**
 * Create a new product/post
 * @param payload - The product data
 * @returns The created product data or undefined on error
 */
export const createProduct = async (payload: CreateProductPayload): Promise<any> => {
  try {
    // Get token from cookies
    const token = Cookies.get("token")

    if (!token) {
      console.error("Auth token is missing")
      return undefined
    }

    const response: AxiosResponse<CreateProductResponse> = await axiosInstance.post(`/v1/create/product`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Create product API response:", response.data)

    // Return the data array from the response
    return response.data.data
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

/**
 * Submit a posting link for a product
 * @param id - The product ID
 * @param submittedPostUrl - The posting link to submit
 * @returns The updated product data or undefined on error
 */
export const submitPostingLink = async (
  id: string,
  submittedPostUrl: string,
): Promise<SubmitPostingLinkResponse["data"] | undefined> => {
  try {
    // Get token from cookies
    const token = Cookies.get("token")

    if (!token) {
      console.error("Auth token is missing")
      return undefined
    }

    console.log(`Calling API: /v1/submit-post/${id} with submittedPostUrl: ${submittedPostUrl}`) // Debug log

    const response: AxiosResponse<SubmitPostingLinkResponse> = await axiosInstance.post(
      `/v1/submit-post/${id}`,
      { submittedPostUrl }, // Use the correct field name as expected by the API
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log("API response received:", response.data) // Debug log

    // Return the data property from the response
    return response.data.data
  } catch (error) {
    console.error("Error submitting posting link:", error)
    throw error
  }
}
