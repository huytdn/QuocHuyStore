import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/useAuthStore";

export const useAddresses = (params = {}) => {
  const isUserLoggedIn = useAuthStore((state) => !!state.accessToken);

  return useQuery({
    queryKey: ["addresses", params],
    queryFn: async () => {
      const response = await axiosClient.get("/addresses", { params });
      return response.data; // PageResponseDto<AddressResponseDto>
    },
    enabled: isUserLoggedIn,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosClient.post("/addresses", payload);
      return response.data; // AddressResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ addressId, payload }) => {
      const response = await axiosClient.put(`/addresses/${addressId}`, payload);
      return response.data; // AddressResponseDto
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["addresses", data.id] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId) => {
      await axiosClient.delete(`/addresses/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};
