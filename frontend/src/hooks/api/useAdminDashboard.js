import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

export const useDashboardKpis = (params = {}) => {
  return useQuery({
    queryKey: ["dashboardKpis", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/dashboard/kpis", { params });
      return response.data; // DashboardKpiResponseDto
    },
  });
};

export const useDashboardRevenueChart = (params = {}) => {
  return useQuery({
    queryKey: ["dashboardRevenueChart", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/dashboard/revenue-chart", { params });
      return response.data; // DashboardRevenueChartResponseDto
    },
  });
};

export const useDashboardOrderAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ["dashboardOrderAnalytics", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/dashboard/order-analytics", { params });
      return response.data; // DashboardOrderAnalyticsResponseDto
    },
  });
};

export const useDashboardTopProducts = (params = {}) => {
  return useQuery({
    queryKey: ["dashboardTopProducts", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/dashboard/top-products", { params });
      return response.data; // List<DashboardTopProductResponseDto>
    },
  });
};

export const useDashboardCategoryRevenue = (params = {}) => {
  return useQuery({
    queryKey: ["dashboardCategoryRevenue", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/dashboard/category-revenue", { params });
      return response.data; // List<DashboardCategoryRevenueResponseDto>
    },
  });
};

export const useDashboardLowStock = (params = {}) => {
  return useQuery({
    queryKey: ["dashboardLowStock", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/dashboard/low-stock", { params });
      return response.data; // PageResponseDto<DashboardLowStockItemDto>
    },
  });
};
