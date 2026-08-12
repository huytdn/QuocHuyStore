import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const response = await axiosClient.post("/orders", orderData);
      return response.data; // OrderResponseDto (contains paymentUrl if ONLINE_PAYMENT)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUserOrders = (params = {}) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const response = await axiosClient.get("/orders", { params });
      return response.data; // PageResponseDto<OrderResponseDto>
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId) => {
      const response = await axiosClient.patch(`/orders/${orderId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
