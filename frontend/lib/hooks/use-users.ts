import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
	User,
	CreateUserRequest,
	UpdateUserRequest,
	UserListParams,
	BulkUpdateUsersRequest,
	ApiResponse,
	Pagination,
	UserStats,
} from "@/lib/types/api.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Helper function to get auth token
const getAuthToken = () => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("token");
};

// Helper function to create headers with auth token
const getAuthHeaders = () => {
	const token = getAuthToken();
	return {
		"Content-Type": "application/json",
		...(token && { Authorization: `Bearer ${token}` }),
	};
};

// ==================== API FUNCTIONS ====================

// Get all users with filters and pagination
export const getUsers = async (params?: UserListParams): Promise<ApiResponse<User[]>> => {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.append("page", params.page.toString());
	if (params?.limit) queryParams.append("limit", params.limit.toString());
	if (params?.role) queryParams.append("role", params.role);
	if (params?.search) queryParams.append("search", params.search);

	const response = await fetch(
		`${API_URL}/api/v1/users?${queryParams.toString()}`,
		{
			headers: getAuthHeaders(),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to fetch users");
	}

	return response.json();
};

// Get user by ID
export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
	const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
		headers: getAuthHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to fetch user");
	}

	return response.json();
};

// Get user statistics
export const getUserStats = async (id: string): Promise<ApiResponse<UserStats>> => {
	const response = await fetch(`${API_URL}/api/v1/users/${id}/stats`, {
		headers: getAuthHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to fetch user statistics");
	}

	return response.json();
};

// Create user (Admin only)
export const createUser = async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
	const response = await fetch(`${API_URL}/api/v1/users`, {
		method: "POST",
		headers: getAuthHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to create user");
	}

	return response.json();
};

// Update user
export const updateUser = async (
	id: string,
	data: UpdateUserRequest
): Promise<ApiResponse<User>> => {
	const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
		method: "PUT",
		headers: getAuthHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to update user");
	}

	return response.json();
};

// Delete user (Admin only)
export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
	const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
		method: "DELETE",
		headers: getAuthHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to delete user");
	}

	return response.json();
};

// Bulk update users (Admin only)
export const bulkUpdateUsers = async (
	data: BulkUpdateUsersRequest
): Promise<ApiResponse<{ updatedCount: number }>> => {
	const response = await fetch(`${API_URL}/api/v1/users/bulk`, {
		method: "PATCH",
		headers: getAuthHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to bulk update users");
	}

	return response.json();
};

// ==================== REACT QUERY HOOKS ====================

// Get all users
export const useUsers = (params?: UserListParams) => {
	return useQuery({
		queryKey: ["users", params],
		queryFn: () => getUsers(params),
		staleTime: 30000, // 30 seconds
	});
};

// Get user by ID
export const useUser = (id: string) => {
	return useQuery({
		queryKey: ["users", id],
		queryFn: () => getUserById(id),
		enabled: !!id,
	});
};

// Get user statistics
export const useUserStats = (id: string) => {
	return useQuery({
		queryKey: ["users", id, "stats"],
		queryFn: () => getUserStats(id),
		enabled: !!id,
	});
};

// Create user mutation
export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("تم إنشاء المستخدم بنجاح");
		},
		onError: (error: Error) => {
			toast.error(error.message || "فشل إنشاء المستخدم");
		},
	});
};

// Update user mutation
export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
			updateUser(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
			toast.success("تم تحديث المستخدم بنجاح");
		},
		onError: (error: Error) => {
			toast.error(error.message || "فشل تحديث المستخدم");
		},
	});
};

// Delete user mutation
export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("تم حذف المستخدم بنجاح");
		},
		onError: (error: Error) => {
			toast.error(error.message || "فشل حذف المستخدم");
		},
	});
};

// Bulk update users mutation
export const useBulkUpdateUsers = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: bulkUpdateUsers,
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(`تم تحديث ${response.data?.updatedCount} مستخدم بنجاح`);
		},
		onError: (error: Error) => {
			toast.error(error.message || "فشل تحديث المستخدمين");
		},
	});
};
