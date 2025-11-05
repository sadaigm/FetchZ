import axios, { type AxiosRequestConfig } from 'axios';
import { updateProtocol } from './utils/environment-variable-utils';

const apiClient = axios.create({
  baseURL: '', // Set a default base URL if needed
  timeout: 10000, // Set a timeout for requests
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Modify the request config before sending it
    // For example, add authorization headers if needed
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Process the response data
    return response;
  },
  (error) => {
    // Handle response errors
    return Promise.reject(error);
  }
);

export const sendRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  headers?: Record<string, string>,
  params?: Record<string, string>
) => {
  // Update URL to ensure it has a protocol
  const updatedUrl = updateProtocol(url);
  
  const config: AxiosRequestConfig = {
    method,
    url: updatedUrl,
    data,
    headers,
    params,
  };

  try {
    const response = await apiClient(config);
    return response; // Return the full axios response, not just data
  } catch (error) {
    console.error('Error sending request:', error);
    throw error;
  }
};

export default apiClient;
