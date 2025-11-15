import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ============ Types ============

export interface Location {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  limit: number;
  monthlyViewers: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    reservations: number;
  };
}

export interface CreateLocationDto {
  name: string;
  description?: string;
  isActive?: boolean;
  limit?: number;
  monthlyViewers?: number;
}

export interface UpdateLocationDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  limit?: number;
  monthlyViewers?: number;
}

export interface LocationStatistics {
  location: {
    id: string;
    name: string;
    description: string | null;
  };
  totalReservations: number;
  totalDurationHours: number;
  averageDuration: number;
  statusBreakdown: {
    waiting: number;
    active: number;
    endingSoon: number;
    completed: number;
  };
}

// ============ API Functions ============

export const getAllLocations = async (includeInactive = false): Promise<Location[]> => {
  const response = await fetch(
    `${API_URL}/api/v1/locations?includeInactive=${includeInactive}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch locations");
  }

  const data = await response.json();
  return data.data;
};

export const getLocationById = async (id: string): Promise<Location> => {
  const response = await fetch(`${API_URL}/api/v1/locations/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch location");
  }

  const data = await response.json();
  return data.data;
};

export const getLocationStatistics = async (
  id: string,
  startDate?: string,
  endDate?: string
): Promise<LocationStatistics> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await fetch(
    `${API_URL}/api/v1/locations/${id}/statistics${params.toString() ? `?${params.toString()}` : ""}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location statistics");
  }

  const data = await response.json();
  return data.data;
};

export const createLocation = async (data: CreateLocationDto): Promise<Location> => {
  const response = await fetch(`${API_URL}/api/v1/locations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create location");
  }

  const result = await response.json();
  return result.data;
};

export const updateLocation = async (
  id: string,
  data: UpdateLocationDto
): Promise<Location> => {
  const response = await fetch(`${API_URL}/api/v1/locations/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update location");
  }

  const result = await response.json();
  return result.data;
};

export const deleteLocation = async (id: string, hardDelete = false): Promise<void> => {
  const response = await fetch(
    `${API_URL}/api/v1/locations/${id}?hard=${hardDelete}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete location");
  }
};

// ============ React Query Hooks ============

export const useLocations = (includeInactive = false) => {
  return useQuery({
    queryKey: ["locations", includeInactive],
    queryFn: () => getAllLocations(includeInactive),
  });
};

export const useLocation = (id: string) => {
  return useQuery({
    queryKey: ["locations", id],
    queryFn: () => getLocationById(id),
    enabled: !!id,
  });
};

export const useLocationStatistics = (
  id: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ["locations", id, "statistics", startDate, endDate],
    queryFn: () => getLocationStatistics(id, startDate, endDate),
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationDto }) =>
      updateLocation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations", variables.id] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) =>
      deleteLocation(id, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};
