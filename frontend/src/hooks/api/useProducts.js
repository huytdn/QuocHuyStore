import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

// Re-export Category Hooks from useCategories.js for clean modularity
export * from "./useCategories";

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

export const useAdminProducts = (params = {}) => {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/products", { params });
      return response.data; // PageResponseDto<ProductListResponseDto>
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminProductDetail = (id) => {
  return useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/admin/products/${id}`);
      return response.data; // ProductDetailResponseDto
    },
    enabled: !!id,
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

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, metadata }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await axiosClient.post("/admin/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file, metadata }) => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("metadata", JSON.stringify(metadata));

      const response = await axiosClient.put(`/admin/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

export const useCreateColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, colorName, file }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("colorName", colorName);

      const response = await axiosClient.post(
        `/admin/products/${productId}/colors`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data; // ProductColorResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};

export const useUpdateColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, colorName, file }) => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("colorName", colorName);

      const response = await axiosClient.put(`/admin/colors/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};

export const useDeleteColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/admin/colors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};

export const useCreateVariation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ colorId, size, unitPrice, stockQuantity }) => {
      const response = await axiosClient.post(
        `/admin/colors/${colorId}/variations`,
        { size, unitPrice, stockQuantity }
      );
      return response.data; // ProductVariationResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};

export const useUpdateVariation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, size, unitPrice, stockQuantity }) => {
      const response = await axiosClient.put(`/admin/variations/${id}`, {
        size,
        unitPrice,
        stockQuantity,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stockQuantity }) => {
      const response = await axiosClient.patch(`/admin/variations/${id}/stock`, {
        stockQuantity,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};

export const useDeleteVariation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/admin/variations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};
