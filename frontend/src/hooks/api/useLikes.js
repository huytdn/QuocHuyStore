import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

/**
 * Fetch paginated list of liked products for the currently authenticated user
 * GET /users/me/likes
 */
export const useLikedProducts = (params = {}) => {
  return useQuery({
    queryKey: ["liked-products", params],
    queryFn: async () => {
      const response = await axiosClient.get("/users/me/likes", { params });
      return response.data; // PageResponseDto<ProductListResponseDto>
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Toggle like status for a product
 * POST /products/{productId}/like
 */
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await axiosClient.post(`/products/${productId}/like`);
      return response.data; // LikeToggleResponseDto { productId, isLiked, message }
    },
    onSuccess: () => {
      // Invalidate relevant queries so all views stay in sync
      queryClient.invalidateQueries({ queryKey: ["liked-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};
