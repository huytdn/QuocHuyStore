import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/useAuthStore";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axiosClient.get("/users/me");
      return response.data; // UserDetailResponseDto
    },
  });
};

export const useLogin = () => {
  const loginStore = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await axiosClient.post("/auth/login", credentials);
      return response.data; // TokenResponseDto
    },
    onSuccess: (data) => {
      const { user, accessToken } = data;
      loginStore(user, accessToken);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await axiosClient.post("/auth/register", userData);
      return response.data; // UserResponseDto
    },
  });
};

export const useLogout = () => {
  const logoutStore = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await axiosClient.post("/auth/logout");
    },
    onSuccess: () => {
      logoutStore();
    },
    onError: () => {
      // Even if server session invalidation fails, clear local tokens
      logoutStore();
    },
  });
};

export const useUpdateProfile = () => {
  const updateUserStore = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData) => {
      const response = await axiosClient.put("/users/me", profileData);
      return response.data; // UserResponseDto
    },
    onSuccess: (data) => {
      updateUserStore(data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useSoftDeleteAccount = () => {
  const logoutStore = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosClient.delete("/users/me");
    },
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
    },
  });
};

