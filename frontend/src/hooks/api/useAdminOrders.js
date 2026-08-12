import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

export const useAdminOrders = (params = {}) => {
  return useQuery({
    queryKey: ["adminOrders", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/orders", { params });
      return response.data; // PageResponseDto<OrderResponseDto>
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axiosClient.patch(`/admin/orders/${id}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },
  });
};
