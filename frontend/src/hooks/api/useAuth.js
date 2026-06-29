import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/useAuthStore";

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
