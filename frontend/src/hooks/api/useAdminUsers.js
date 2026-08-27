import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

export const useAdminUsersSummary = (params = {}) => {
  return useQuery({
    queryKey: ["adminUsersSummary", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/users/summary", { params });
      return response.data; // UserAnalyticsSummaryDto
    },
  });
};

export const useAdminUserList = (params = {}) => {
  return useQuery({
    queryKey: ["adminUserList", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/users", { params });
      return response.data; // PageResponseDto<AdminUserListItemDto>
    },
  });
};

export const useRecalculateAllSpent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.post("/admin/users/recalculate-all-spent");
      return response.data; // AdminRecalculateAllResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUserList"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsersSummary"] });
    },
  });
};

export const useBroadcastMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (broadcastData) => {
      const response = await axiosClient.post("/admin/conversations/broadcast", broadcastData);
      return response.data; // BulkMessageResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
    },
  });
};
