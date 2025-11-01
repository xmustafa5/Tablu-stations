import axiosInstance from "./axiosInstance";
import type { LoginRequest, RegisterRequest, ApiResponse, AuthResponse, User } from "../types/api.types";
import axios from "axios";

/**
 * Login user
 * POST /api/v1/auth/login
 */
export async function loginUser(data: LoginRequest) {
  const response = await axios.post(
    'http://localhost:3000/api/v1/auth/login',
    data
  );

  // Store token if login successful
  if (response.data.success && response.data.data?.token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.data.token);
    }
  }

  return response.data;
}

/**
 * Client-side login wrapper
 */
export async function loginUserClient(data: LoginRequest) {
  return loginUser(data);
}

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export async function registerUser(data: RegisterRequest) {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
    'http://localhost:3000/api/v1/auth/register',
    data
  );

  // Store token if registration successful
  if (response.data.success && response.data.data?.token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.data.token);
    }
  }

  return response.data;
}

/**
 * Client-side register wrapper
 */
export async function registerUserClient(data: RegisterRequest) {
  return registerUser(data);
}

/**
 * Get current authenticated user
 * GET /api/v1/auth/me
 */
export async function getCurrentUser() {
  const response = await axiosInstance.get<ApiResponse<User>>('/api/v1/auth/me');
  return response.data;
}

/**
 * Client-side get current user wrapper
 */
export async function getCurrentUserClient() {
  return getCurrentUser();
}

/**
 * Logout user (client-side only)
 */
export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return !!token;
  }
  return false;
}

/**
 * Get stored token
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}
