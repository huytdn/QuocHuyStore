import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";

// ==========================================
// 1. CLIENT VOUCHER HOOKS (USER ONLY)
// ==========================================

/**
 * Lấy danh sách Voucher công khai khả dụng cho người dùng
 * Endpoint: GET /vouchers
 */
export const usePublicVouchers = () => {
  return useQuery({
    queryKey: ["public-vouchers"],
    queryFn: async () => {
      const response = await axiosClient.get("/vouchers");
      return response.data; // Array of VoucherResponseDto
    },
  });
};

/**
 * Thẩm định mã voucher và lấy số tiền giảm giá tạm tính
 * Endpoint: POST /vouchers/validate
 * Payload: { code: string, orderAmount: number }
 */
export const useValidateVoucher = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosClient.post("/vouchers/validate", payload);
      return response.data; // VoucherValidateResponseDto
    },
  });
};

// ==========================================
// 2. ADMIN VOUCHER HOOKS (ADMIN ONLY)
// ==========================================

/**
 * Lấy danh sách Voucher phân trang & tìm kiếm cho Admin
 * Endpoint: GET /admin/vouchers
 * Params: { page, size, isActive, search }
 */
export const useAdminVouchers = (params = {}) => {
  return useQuery({
    queryKey: ["admin-vouchers", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/vouchers", { params });
      return response.data; // PageResponseDto<VoucherResponseDto>
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Lấy thông tin chi tiết một Voucher theo UUID
 * Endpoint: GET /admin/vouchers/{id}
 */
export const useAdminVoucherDetail = (id) => {
  return useQuery({
    queryKey: ["admin-voucher", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosClient.get(`/admin/vouchers/${id}`);
      return response.data; // VoucherResponseDto
    },
    enabled: !!id,
  });
};

/**
 * Tạo mới Voucher
 * Endpoint: POST /admin/vouchers
 * Payload: VoucherRequestDto
 */
export const useCreateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosClient.post("/admin/vouchers", payload);
      return response.data; // VoucherResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["public-vouchers"] });
    },
  });
};

/**
 * Cập nhật Voucher
 * Endpoint: PUT /admin/vouchers/{id}
 * Payload: { id, payload: VoucherRequestDto }
 */
export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await axiosClient.put(`/admin/vouchers/${id}`, payload);
      return response.data; // VoucherResponseDto
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-voucher", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["public-vouchers"] });
    },
  });
};

/**
 * Xóa mềm Voucher (Vô hiệu hóa isActive = false)
 * Endpoint: DELETE /admin/vouchers/{id}
 */
export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosClient.delete(`/admin/vouchers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["public-vouchers"] });
    },
  });
};
