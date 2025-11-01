'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import type { LoginRequest, RegisterRequest } from '../types/api.types';
import { useAuth } from '../store/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Hook for login mutation
 */
export function useLogin() {
  const { setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      console.log('Login response:', response);
      if (response.success && response.data) {
        setUser(response.data.user);
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error('Login failed. Invalid response from server.');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      const errorMessage = error?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook for register mutation
 */
export function useRegister() {
  const { setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setUser(response.data.user);
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        toast.success('Registration successful!');
        router.push('/dashboard');
      }
    },
    onError: (error: any) => {
      const message = error?.message || 'Registration failed. Please try again.';
      toast.error(message);
    },
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
  });
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { setUser } = useAuth();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      }
      return null;
    },
    enabled: !!authService.getToken(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
