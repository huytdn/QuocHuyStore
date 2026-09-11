import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

/**
 * Hook to perform AI Image Search
 * POST /products/search-by-image
 *
 * @param {File} file - Image file (JPEG, PNG, WEBP, max 5MB)
 * @param {number} k - Top K matching results (default: 8, clamped [1, 10])
 * @returns Promise<ImageSearchResponseDto>
 */
export const useImageSearch = () => {
  return useMutation({
    mutationFn: async ({ file, k = 8 }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosClient.post("/products/search-by-image", formData, {
        params: { k },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data; // ImageSearchResponseDto { results: ImageSearchResultDto[] }
    },
  });
};

/**
 * Hook for Admin to reindex / backfill image embeddings in batches
 * POST /admin/products/reindex-embeddings?batchSize=20
 *
 * @param {number} batchSize - Number of color variants to process (default: 20)
 * @returns Promise<EmbeddingBackfillResponseDto> { processed, remaining }
 */
export const useReindexEmbeddings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batchSize = 20) => {
      const response = await axiosClient.post(
        "/admin/products/reindex-embeddings",
        null,
        {
          params: { batchSize },
        }
      );
      return response.data; // EmbeddingBackfillResponseDto { processed: number, remaining: number }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
