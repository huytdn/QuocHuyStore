import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

/**
 * Lấy danh sách đánh giá sản phẩm theo slug (Public API)
 * Endpoint: GET /products/{slug}/reviews
 * Params: { page, size, rating }
 */
export const useProductReviews = (slug, params = {}) => {
  return useQuery({
    queryKey: ["product-reviews", slug, params],
    queryFn: async () => {
      if (!slug) return null;
      const response = await axiosClient.get(`/products/${slug}/reviews`, { params });
      return response.data; // PageResponseDto<ReviewResponseDto>
    },
    enabled: !!slug,
  });
};

/**
 * Tạo mới hoặc cập nhật (upsert) đánh giá sản phẩm (Yêu cầu đăng nhập ROLE_USER)
 * Endpoint: POST /reviews
 * Payload: { orderItemId, rating, content, file, slug }
 * Content-Type: multipart/form-data (metadata JSON string + file optional)
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderItemId, rating, content, file }) => {
      const formData = new FormData();

      // metadata JSON string: { orderItemId, rating, content }
      const metadata = {
        orderItemId,
        rating: Number(rating),
        content: content ? content.trim() : "",
      };
      formData.append("metadata", JSON.stringify(metadata));

      // Optional image file
      if (file) {
        formData.append("file", file);
      }

      const response = await axiosClient.post("/reviews", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data; // ReviewResponseDto
    },
    onSuccess: (_, variables) => {
      if (variables.slug) {
        queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.slug] });
        queryClient.invalidateQueries({ queryKey: ["product", variables.slug] });
      }
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
  });
};
