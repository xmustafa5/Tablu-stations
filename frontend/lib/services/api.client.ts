import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types/api.types';

// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add token to headers
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response) => {
        // Return only the data portion of the response
        return response.data;
      },
      (error: AxiosError<ApiResponse<any>>) => {
        // Handle different error scenarios
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401:
              // Unauthorized - clear token and redirect to login
              this.clearToken();
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              break;

            case 403:
              // Forbidden - insufficient permissions
              console.error('Access forbidden:', data?.message);
              break;

            case 404:
              // Not found
              console.error('Resource not found:', data?.message);
              break;

            case 429:
              // Rate limit exceeded
              console.error('Rate limit exceeded. Please try again later.');
              break;

            case 500:
              // Server error
              console.error('Server error:', data?.message);
              break;

            default:
              console.error('API Error:', data?.message || error.message);
          }

          // Return the error data for component-level handling
          return Promise.reject(data || { success: false, message: error.message });
        } else if (error.request) {
          // Request was made but no response received
          console.error('Network error: No response received');
          return Promise.reject({
            success: false,
            message: 'Network error. Please check your connection.',
          });
        } else {
          // Something else happened
          console.error('Error:', error.message);
          return Promise.reject({
            success: false,
            message: error.message,
          });
        }
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // HTTP Methods
  async get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data);
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    return this.client.patch(url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.client.delete(url);
  }

  // Get the underlying axios instance (for advanced usage)
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export the class for testing or custom instances
export default ApiClient;
