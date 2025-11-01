import { apiClient } from './api.client';
import type {
  ApiResponse,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  User,
} from '../types/api.types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/v1/auth/register',
      data
    );

    // Store token if registration successful
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return response;
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/v1/auth/login',
      data
    );

    // Store token if login successful
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return response;
  }

  /**
   * Get current authenticated user
   * GET /api/v1/auth/me
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>('/api/v1/auth/me');
  }

  /**
   * Logout user (client-side only)
   * Clears token and user data
   */
  logout(): void {
    apiClient.clearToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }
}

// Export a singleton instance
export const authService = new AuthService();

// Export the class for testing
export default AuthService;
