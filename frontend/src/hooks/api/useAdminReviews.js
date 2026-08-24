import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

/**
 * Hook lấy danh sách đánh giá phân trang dành cho Admin Console
 * Endpoint: GET /admin/reviews
 * @param {Object} params - { page, size, rating, productId, hasImage, search }
 */
export const useAdminReviews = (params = {}) => {
  return useQuery({
    queryKey: ["admin-reviews", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/reviews", { params });
      return response.data; // PageResponseDto<ReviewResponseDto>
    },
  });
};

export default useAdminReviews;
