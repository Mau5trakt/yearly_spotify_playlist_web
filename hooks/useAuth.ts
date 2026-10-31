"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface AuthResponse {
  isLoggedIn: boolean;
  user: {
    id: string;
    displayName: string;
    imageUrl?: string;
  } | null;
}

export const AUTH_QUERY_KEY = ["auth_me"] as const;

export function useAuthQuery() {
  return useQuery<AuthResponse>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<AuthResponse>("/api/auth/me");
        return data;
      } catch {
        return { isLoggedIn: false, user: null };
      }
    },
    retry: false,
    staleTime: 0,
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, { isLoggedIn: false, user: null });
    },
  });
}
