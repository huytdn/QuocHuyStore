import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const response = await axiosClient.get("/products", { params });
      return response.data; // PageResponseDto<ProductListResponseDto>
    },
    placeholderData: (previousData) => previousData, // Keeps UI smooth during pagination
  });
};

export const useProductDetail = (slug) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await axiosClient.get(`/products/${slug}`);
      return response.data; // ProductDetailResponseDto
    },
    enabled: !!slug,
  });
};

export const useCategories = (params = {}) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      const response = await axiosClient.get("/categories", { params });
      return response.data; // PageResponseDto<CategoryResponseDto>
    },
  });
};
