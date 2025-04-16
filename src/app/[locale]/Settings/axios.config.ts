import axios, {
    AxiosInstance,
    AxiosResponse,
    AxiosError,
  } from "axios";
  
  // Create an Axios instance
  const axiosInstance: AxiosInstance = axios.create({
  
    baseURL: "https://newbackend.crective.com/v1",
    // timeout: 10000, // Set a timeout for requests
    headers: {
      "Content-Type": "application/json"
    },
  });
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    (error: AxiosError): Promise<AxiosError> => {
      if (error.response) {
        // Handle common response errors
        if (error.response.status === 401) {
          // Handle unauthorized error, e.g., redirect to login
        } else if (error.response.status === 403) {
          // Handle forbidden error
        } else if (error.response.status === 404) {
          // Handle not found error
        } else if (error.response.status >= 500) {
          // Handle server errors
        }
      }
      return Promise.reject(error);
     
    }
  );
  
  export default axiosInstance;
