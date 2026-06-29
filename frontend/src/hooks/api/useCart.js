import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/useAuthStore";

export const useCart = () => {
  const isUserLoggedIn = useAuthStore((state) => !!state.accessToken);

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await axiosClient.get("/cart");
      return response.data; // List<CartItemResponseDto>
    },
    enabled: isUserLoggedIn, // Fetch only when authenticated
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosClient.post("/cart", payload);
      return response.data; // CartItemResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartItemId, quantity }) => {
      const response = await axiosClient.patch(`/cart/${cartItemId}`, { quantity });
      return response.data; // CartItemResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItemId) => {
      await axiosClient.delete(`/cart/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
