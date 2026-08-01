import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  useProducts,
  useDeleteProduct,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useProductDetail,
  useCreateColor,
  useUpdateColor,
  useDeleteColor,
  useCreateVariation,
  useUpdateVariation,
  useUpdateStock,
  useDeleteVariation,
} from "../../hooks/api/useProducts";

const ManageColorsModal = ({ product, onClose }) => {
  const { data: productDetail, isLoading } = useProductDetail(
    product?.slug || product?.id
  );
  const createColorMutation = useCreateColor();
  const updateColorMutation = useUpdateColor();
  const deleteColorMutation = useDeleteColor();

  const createVariationMutation = useCreateVariation();
  const updateVariationMutation = useUpdateVariation();
  const updateStockMutation = useUpdateStock();
  const deleteVariationMutation = useDeleteVariation();

  // Add Color state
  const [colorName, setColorName] = useState("");
  const [colorFile, setColorFile] = useState(null);
  const [colorError, setColorError] = useState("");

  // Edit Color state
  const [editingColorId, setEditingColorId] = useState(null);
  const [editColorName, setEditColorName] = useState("");
  const [editColorFile, setEditColorFile] = useState(null);

  // Add Variation state per color
  const [addingVariationForColorId, setAddingVariationForColorId] = useState(null);
  const [varSize, setVarSize] = useState("");
  const [varPrice, setVarPrice] = useState("");
  const [varStock, setVarStock] = useState("");
  const [varError, setVarError] = useState("");

  // Edit Variation state
  const [editingVariationId, setEditingVariationId] = useState(null);
  const [editVarSize, setEditVarSize] = useState("");
  const [editVarPrice, setEditVarPrice] = useState("");
  const [editVarStock, setEditVarStock] = useState("");

  const handleCreateColor = (e) => {
    e.preventDefault();
    setColorError("");
    if (!colorName.trim() || !colorFile) {
      setColorError("Vui lòng nhập tên màu và chọn file hình ảnh!");
      return;
    }

    createColorMutation.mutate(
      {
        productId: product.id,
        colorName: colorName.trim(),
        file: colorFile,
      },
      {
        onSuccess: () => {
          setColorName("");
          setColorFile(null);
          setColorError("");
          alert("Thêm màu sắc thành công!");
        },
        onError: (err) => {
          setColorError(
            err.response?.data?.message || "Thêm màu sắc thất bại!"
          );
        },
      }
    );
  };

  const handleStartEditColor = (c) => {
    setEditingColorId(c.colorId);
    setEditColorName(c.colorName);
    setEditColorFile(null);
  };

  const handleSaveEditColor = (e, colorId) => {
    e.preventDefault();
    if (!editColorName.trim()) {
      alert("Tên màu sắc không được để trống!");
      return;
    }

    updateColorMutation.mutate(
      {
        id: colorId,
        colorName: editColorName.trim(),
        file: editColorFile,
      },
      {
        onSuccess: () => {
          setEditingColorId(null);
          setEditColorName("");
          setEditColorFile(null);
          alert("Cập nhật màu sắc thành công!");
        },
        onError: (err) => {
          alert(err.response?.data?.message || "Cập nhật màu sắc thất bại!");
        },
      }
    );
  };

  const handleDeleteColor = (colorId, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa màu sắc "${name}"?`)) {
      deleteColorMutation.mutate(colorId, {
        onSuccess: () => alert("Xóa màu thành công!"),
        onError: (err) =>
          alert(
            err.response?.data?.message ||
              "Xóa màu thất bại! (Có thể có biến thể đang hoạt động)"
          ),
      });
    }
  };

  const handleCreateVariation = (e, colorId) => {
    e.preventDefault();
    setVarError("");
    if (!varSize.trim() || !varPrice || varStock === "") {
      setVarError("Vui lòng nhập đầy đủ Size, Đơn giá và Số lượng tồn!");
      return;
    }

    createVariationMutation.mutate(
      {
        colorId,
        size: varSize.trim(),
        unitPrice: parseFloat(varPrice),
        stockQuantity: parseInt(varStock, 10),
      },
      {
        onSuccess: () => {
          setVarSize("");
          setVarPrice("");
          setVarStock("");
          setAddingVariationForColorId(null);
          alert("Thêm kích thước biến thể thành công!");
        },
        onError: (err) => {
          setVarError(
            err.response?.data?.message || "Thêm biến thể thất bại!"
          );
        },
      }
    );
  };

  const handleStartEditVariation = (v) => {
    setEditingVariationId(v.variationId);
    setEditVarSize(v.size);
    setEditVarPrice(v.unitPrice);
    setEditVarStock(v.stockQuantity);
  };

  const handleSaveEditVariation = (e, variationId) => {
    e.preventDefault();
    if (!editVarSize.trim() || !editVarPrice || editVarStock === "") {
      alert("Vui lòng nhập đầy đủ Size, Đơn giá và Tồn kho!");
      return;
    }

    updateVariationMutation.mutate(
      {
        id: variationId,
        size: editVarSize.trim(),
        unitPrice: parseFloat(editVarPrice),
        stockQuantity: parseInt(editVarStock, 10),
      },
      {
        onSuccess: () => {
          setEditingVariationId(null);
          alert("Cập nhật biến thể thành công!");
        },
        onError: (err) => {
          alert(err.response?.data?.message || "Cập nhật biến thể thất bại!");
        },
      }
    );
  };

  const handlePatchStock = (v) => {
    const inputStr = window.prompt(
      `Cập nhật nhanh tồn kho cho Size ${v.size}:`,
      v.stockQuantity
    );
    if (inputStr !== null && inputStr.trim() !== "") {
      const newStock = parseInt(inputStr, 10);
      if (isNaN(newStock) || newStock < 0) {
        alert("Số lượng tồn kho không hợp lệ!");
        return;
      }

      updateStockMutation.mutate(
        { id: v.variationId, stockQuantity: newStock },
        {
          onSuccess: () => alert("Cập nhật tồn kho thành công!"),
          onError: (err) =>
            alert(err.response?.data?.message || "Cập nhật kho thất bại!"),
        }
      );
    }
  };

  const handleDeleteVariation = (variationId, size) => {
    if (window.confirm(`Bạn có chắc muốn xóa size "${size}"?`)) {
      deleteVariationMutation.mutate(variationId, {
        onSuccess: () => alert("Xóa biến thể thành công!"),
        onError: (err) =>
          alert(err.response?.data?.message || "Xóa thất bại!"),
      });
    }
  };

  const colors = productDetail?.colors || [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white border border-[#cfc4c5] w-full max-w-3xl p-8 relative shadow-xl text-left max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors material-symbols-outlined cursor-pointer select-none"
        >
          close
        </button>

        <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-[#cfc4c5]">
          <div className="w-12 h-16 bg-[#efeded] flex-shrink-0 overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-black uppercase tracking-wider">
              Quản lý Màu sắc & Biến thể: {product.name}
            </h3>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">
              Danh mục: {product.categoryName} • ID: #{product.id}
            </p>
          </div>
        </div>

        {/* Existing Colors List */}
        <div className="mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-4">
            Danh sách Màu sắc ({colors.length})
          </h4>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              Đang tải chi tiết màu sắc...
            </div>
          ) : colors.length === 0 ? (
            <div className="p-6 bg-[#f5f3f3] text-center text-xs text-neutral-500 font-light border border-dashed border-[#cfc4c5]">
              Sản phẩm này chưa có màu sắc nào. Vui lòng thêm màu mới bên dưới!
            </div>
          ) : (
            <div className="space-y-4">
              {colors.map((c) => (
                <div
                  key={c.colorId}
                  className="border border-[#cfc4c5] p-4 bg-[#fbf9f9]"
                >
                  {/* Color Header or Edit Color Form */}
                  {editingColorId === c.colorId ? (
                    <form
                      onSubmit={(e) => handleSaveEditColor(e, c.colorId)}
                      className="bg-white p-3 border border-[#cfc4c5] mb-3 space-y-3"
                    >
                      <p className="text-[10px] font-bold uppercase text-black">
                        Chỉnh sửa màu sắc: #{c.colorId}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 uppercase">
                            Tên màu mới
                          </label>
                          <input
                            type="text"
                            value={editColorName}
                            onChange={(e) => setEditColorName(e.target.value)}
                            className="w-full text-xs p-2 bg-[#f5f3f3] border-none rounded-none focus:ring-1 focus:ring-black"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 uppercase">
                            Đổi ảnh màu (Tùy chọn)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditColorFile(e.target.files[0])}
                            className="text-xs text-neutral-500 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[9px] file:font-bold file:uppercase file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer rounded-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingColorId(null)}
                          className="border border-[#cfc4c5] text-[10px] font-bold uppercase px-3 py-1.5 hover:bg-[#efeded]"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={updateColorMutation.isPending}
                          className="bg-black text-white text-[10px] font-bold uppercase px-3 py-1.5 hover:bg-neutral-800 disabled:opacity-50"
                        >
                          {updateColorMutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-16 bg-white border border-[#cfc4c5] overflow-hidden">
                          <img
                            src={c.imageUrl}
                            alt={c.colorName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-black">
                            {c.colorName}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase">
                            {c.variations?.length || 0} Size biến thể
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStartEditColor(c)}
                          className="material-symbols-outlined text-neutral-400 hover:text-black transition-colors p-1 cursor-pointer"
                          title="Sửa tên & ảnh màu (PUT /admin/colors/{id})"
                        >
                          edit
                        </button>
                        <button
                          onClick={() =>
                            setAddingVariationForColorId(
                              addingVariationForColorId === c.colorId
                                ? null
                                : c.colorId
                            )
                          }
                          className="text-[10px] font-bold uppercase bg-black text-white px-3 py-1.5 hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          {addingVariationForColorId === c.colorId
                            ? "Hủy"
                            : "+ Thêm Size"}
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteColor(c.colorId, c.colorName)
                          }
                          className="material-symbols-outlined text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Xóa màu"
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Variations Under This Color */}
                  {c.variations && c.variations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#cfc4c5]/60 space-y-2">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase">
                        Kích thước & Giá hiện có:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {c.variations.map((v) => (
                          <div
                            key={v.variationId}
                            className="bg-white px-3 py-2 border border-[#cfc4c5]/40 text-xs flex flex-col justify-between"
                          >
                            {editingVariationId === v.variationId ? (
                              <form
                                onSubmit={(e) =>
                                  handleSaveEditVariation(e, v.variationId)
                                }
                                className="space-y-2 py-1"
                              >
                                <div>
                                  <label className="text-[8px] font-bold text-neutral-400 uppercase">
                                    Size
                                  </label>
                                  <input
                                    type="text"
                                    value={editVarSize}
                                    onChange={(e) => setEditVarSize(e.target.value)}
                                    className="w-full text-xs p-1 bg-[#f5f3f3] border-none"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-bold text-neutral-400 uppercase">
                                    Giá (VNĐ)
                                  </label>
                                  <input
                                    type="number"
                                    value={editVarPrice}
                                    onChange={(e) => setEditVarPrice(e.target.value)}
                                    className="w-full text-xs p-1 bg-[#f5f3f3] border-none"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-bold text-neutral-400 uppercase">
                                    Tồn kho
                                  </label>
                                  <input
                                    type="number"
                                    value={editVarStock}
                                    onChange={(e) => setEditVarStock(e.target.value)}
                                    className="w-full text-xs p-1 bg-[#f5f3f3] border-none"
                                    required
                                  />
                                </div>
                                <div className="flex justify-end space-x-1 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingVariationId(null)}
                                    className="text-[9px] font-bold uppercase px-2 py-1 border border-[#cfc4c5]"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={updateVariationMutation.isPending}
                                    className="text-[9px] font-bold uppercase px-2 py-1 bg-black text-white"
                                  >
                                    Lưu
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-black mr-2">
                                    Size: {v.size}
                                  </span>
                                  <span className="text-neutral-500 font-semibold block sm:inline">
                                    {Number(v.unitPrice).toLocaleString("vi-VN")}đ
                                  </span>
                                  <div className="mt-1 flex items-center space-x-2">
                                    <span className="text-[10px] font-bold text-neutral-600">
                                      Kho: {v.stockQuantity}
                                    </span>
                                    <button
                                      onClick={() => handlePatchStock(v)}
                                      className="text-[9px] text-blue-600 underline font-bold hover:text-blue-800"
                                      title="Cập nhật nhanh tồn kho (PATCH /admin/variations/{id}/stock)"
                                    >
                                      Sửa kho
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleStartEditVariation(v)}
                                    className="text-neutral-400 hover:text-black font-bold p-1"
                                    title="Sửa size & giá (PUT /admin/variations/{id})"
                                  >
                                    ✎
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteVariation(v.variationId, v.size)
                                    }
                                    className="text-neutral-400 hover:text-red-600 font-bold p-1"
                                    title="Xóa size"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form to Add Variation for this Color */}
                  {addingVariationForColorId === c.colorId && (
                    <form
                      onSubmit={(e) => handleCreateVariation(e, c.colorId)}
                      className="mt-4 pt-3 border-t border-[#cfc4c5] bg-white p-3 space-y-3"
                    >
                      <p className="text-[10px] font-bold uppercase text-black">
                        Thêm Size & Giá cho màu: {c.colorName}
                      </p>
                      {varError && (
                        <p className="text-xs text-red-600 font-bold">
                          {varError}
                        </p>
                      )}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 uppercase">
                            Size
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. S, M, XL"
                            value={varSize}
                            onChange={(e) => setVarSize(e.target.value)}
                            className="w-full text-xs p-2 bg-[#f5f3f3] border-none rounded-none focus:ring-1 focus:ring-black"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 uppercase">
                            Đơn giá (VNĐ)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 1850000"
                            value={varPrice}
                            onChange={(e) => setVarPrice(e.target.value)}
                            className="w-full text-xs p-2 bg-[#f5f3f3] border-none rounded-none focus:ring-1 focus:ring-black"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 uppercase">
                            Số lượng tồn
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 10"
                            value={varStock}
                            onChange={(e) => setVarStock(e.target.value)}
                            className="w-full text-xs p-2 bg-[#f5f3f3] border-none rounded-none focus:ring-1 focus:ring-black"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="submit"
                          disabled={createVariationMutation.isPending}
                          className="bg-black text-white text-[10px] font-bold uppercase px-4 py-2 hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                        >
                          {createVariationMutation.isPending
                            ? "Đang lưu..."
                            : "Lưu Size"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Color Form */}
        <div className="pt-6 border-t border-[#cfc4c5]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-4">
            Thêm Mẫu Màu & Upload Ảnh Mới
          </h4>

          {colorError && (
            <div className="mb-4 p-3 bg-[#ffdad6] text-[#93000a] text-xs font-bold uppercase border border-[#ffdad6]">
              {colorError}
            </div>
          )}

          <form onSubmit={handleCreateColor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">
                  Tên màu sắc
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midnight Black, Ivory White"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  className="bg-[#f5f3f3] border-none text-xs px-3 py-2.5 rounded-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">
                  Hình ảnh màu sắc
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setColorFile(e.target.files[0])}
                  className="text-xs text-neutral-500 file:mr-3 file:py-2 file:px-3 file:border-0 file:text-[9px] file:font-bold file:uppercase file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer rounded-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={createColorMutation.isPending}
                className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {createColorMutation.isPending
                  ? "Đang upload..."
                  : "Upload & Thêm Màu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProductTableRow = ({
  product,
  isSelected,
  onSelect,
  onOpenColors,
  onOpenEdit,
  onDelete,
  formatPrice,
}) => {
  const { data: detail } = useProductDetail(product.slug || product.id);

  // Calculate real total stock from all colors and size variations
  let realStock = 0;
  if (detail?.colors) {
    detail.colors.forEach((c) => {
      if (c.variations) {
        c.variations.forEach((v) => {
          realStock += v.stockQuantity || 0;
        });
      }
    });
  }

  const hasDetailLoaded = !!detail;
  const displayStock = hasDetailLoaded ? realStock : product.stock;
  const status =
    displayStock === 0
      ? "Out of Stock"
      : displayStock <= 5
      ? "Low Stock"
      : "Active";

  const displayPrice = detail?.minPrice || product.minPrice;

  return (
    <tr className="hover:bg-[#f5f3f3] transition-colors group">
      <td className="px-6 py-6 text-center select-none">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product.id)}
          className="w-4 h-4 border-[#cfc4c5] text-black focus:ring-black rounded-none cursor-pointer"
        />
      </td>
      <td className="px-6 py-6">
        <div className="flex items-center">
          <div className="w-16 h-20 bg-[#efeded] flex-shrink-0 overflow-hidden select-none">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={detail?.thumbnailUrl || product.imageUrl}
              alt={product.name}
            />
          </div>
          <div className="ml-4 text-left">
            <p className="font-semibold text-black">{product.name}</p>
            <p className="text-[10px] text-neutral-400 uppercase mt-1 font-bold">
              SKU: {product.sku}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-6">
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {product.categoryName}
        </span>
      </td>
      <td className="px-6 py-6 font-semibold">{formatPrice(displayPrice)}</td>
      <td className="px-6 py-6 text-center">
        <span className={displayStock === 0 ? "text-red-500 font-bold" : ""}>
          {displayStock}
        </span>
      </td>
      <td className="px-6 py-6">
        <span
          className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
            status === "Active"
              ? "bg-[#ece1ce] text-[#696253]"
              : status === "Low Stock"
              ? "bg-[#ffdad6] text-[#93000a]"
              : "bg-[#e4e2e2] text-neutral-500"
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-6 text-right select-none">
        <button
          onClick={() => onOpenColors(product)}
          className="material-symbols-outlined text-neutral-400 hover:text-black mr-2 transition-colors cursor-pointer"
          title="Quản lý Màu sắc & Ảnh"
        >
          palette
        </button>
        <button
          onClick={() => onOpenEdit(product)}
          className="material-symbols-outlined text-neutral-400 hover:text-black mr-2 transition-colors cursor-pointer"
          title="Sửa thông tin sản phẩm (PUT /admin/products/{id})"
        >
          edit
        </button>
        <button
          onClick={() => onDelete(product.id, product.name)}
          className="material-symbols-outlined text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
          title="Xóa sản phẩm"
        >
          delete
        </button>
      </td>
    </tr>
  );
};

const AdminProducts = () => {
  const navigate = useNavigate();

  // States
  const [selectedCategory, setSelectedCategory] = useState("All Collections");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [activePage, setActivePage] = useState(1);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding, product object if editing
  const [selectedProductForColors, setSelectedProductForColors] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState("");

  // API Integration
  const { data: catPage } = useCategories({ page: 0, size: 50 });
  const backendCategories = catPage?.content || [];

  // Match category name to categoryId
  const matchedCat = backendCategories.find((c) => c.name === selectedCategory);
  const categoryId = matchedCat?.id;

  const { data: pageData, isLoading: isProductsLoading } = useProducts({
    page: activePage - 1,
    size: 10,
    categoryId: categoryId || undefined,
  });

  const deleteProductMutation = useDeleteProduct();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const backendProducts = pageData?.content || [];
  const totalElements = pageData ? pageData.totalElements : 0;
  const totalPages = pageData ? pageData.totalPages : 1;

  // Adapt backend products for UI rendering
  const displayProducts = backendProducts.map((p) => {
    const stock = (p.id * 13) % 47;
    const status =
      stock === 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "Active";
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      sku: `LMR-PROD-${String(p.id).padStart(3, "0")}`,
      categoryName: p.categoryName || "Uncategorized",
      minPrice: p.minPrice,
      imageUrl: p.thumbnailUrl,
      stock: stock,
      status: status,
    };
  });

  // Filter display products by status locally if status filter is active
  const filteredDisplayProducts = displayProducts.filter((p) => {
    if (selectedStatus === "All Status") return true;
    return p.status.toLowerCase() === selectedStatus.toLowerCase();
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(filteredDisplayProducts.map((p) => p.id));
      setSelectedProductIds(allIds);
    } else {
      setSelectedProductIds(new Set());
    }
  };

  const handleSelectProduct = (id) => {
    const updated = new Set(selectedProductIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedProductIds(updated);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setNewProduct({ name: "", slug: "", description: "", categoryId: "" });
    setSelectedFile(null);
    setValidationError("");
    setIsModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    const cat = backendCategories.find((c) => c.name === prod.categoryName);
    setEditingProduct(prod);
    setNewProduct({
      name: prod.name,
      slug: prod.slug,
      description: prod.description || "",
      categoryId: cat ? String(cat.id) : "",
    });
    setSelectedFile(null);
    setValidationError("");
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi hệ thống?`
      )
    ) {
      deleteProductMutation.mutate(id, {
        onSuccess: () => {
          alert("Xóa sản phẩm thành công!");
          setSelectedProductIds((prev) => {
            const updated = new Set(prev);
            updated.delete(id);
            return updated;
          });
        },
        onError: (err) => {
          alert(err.response?.data?.message || "Xóa sản phẩm thất bại!");
        },
      });
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("All Collections");
    setSelectedStatus("All Status");
    setActivePage(1);
  };

  const formatPrice = (val) => {
    if (typeof val === "number") {
      return val.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    }
    return val;
  };

  // Helper to generate URL-friendly slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setNewProduct((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleCreateOrUpdateSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!newProduct.name || !newProduct.slug || !newProduct.categoryId) {
      setValidationError("Vui lòng nhập đầy đủ Tên, Slug và chọn Danh mục!");
      return;
    }

    if (!editingProduct && !selectedFile) {
      setValidationError("Vui lòng chọn ảnh đại diện cho sản phẩm mới!");
      return;
    }

    const metadataPayload = {
      name: newProduct.name.trim(),
      slug: newProduct.slug.trim(),
      categoryId: parseInt(newProduct.categoryId, 10),
      description: newProduct.description.trim() || null,
    };

    if (editingProduct) {
      // PUT /admin/products/{id}
      updateProductMutation.mutate(
        {
          id: editingProduct.id,
          file: selectedFile,
          metadata: metadataPayload,
        },
        {
          onSuccess: () => {
            alert("Cập nhật thông tin sản phẩm thành công!");
            setIsModalOpen(false);
            setEditingProduct(null);
            setNewProduct({ name: "", slug: "", description: "", categoryId: "" });
            setSelectedFile(null);
          },
          onError: (err) => {
            setValidationError(
              err.response?.data?.message || "Cập nhật sản phẩm thất bại!"
            );
          },
        }
      );
    } else {
      // POST /admin/products
      createProductMutation.mutate(
        {
          file: selectedFile,
          metadata: metadataPayload,
        },
        {
          onSuccess: () => {
            alert("Tạo sản phẩm mới thành công!");
            setIsModalOpen(false);
            setNewProduct({ name: "", slug: "", description: "", categoryId: "" });
            setSelectedFile(null);
          },
          onError: (err) => {
            setValidationError(
              err.response?.data?.message || "Tạo sản phẩm thất bại!"
            );
          },
        }
      );
    }
  };

  return (
    <div className="bg-[#fbf9f9] text-[#1b1c1c] font-sans antialiased min-h-screen flex text-left">
      {/* Side Navigation Component */}
      <AdminSidebar activeTab="products" />

      {/* Main Content Area */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col">
        {/* Top Navigation Component */}
        <AdminHeader />

        {/* Page Content */}
        <div className="p-16 flex-grow">
          {/* Page Header Actions */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <nav className="flex mb-4 space-x-2 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                <span>Catalogue</span>
                <span>/</span>
                <span className="text-black">All Products</span>
              </nav>
              <h2 className="font-serif text-[48px] leading-tight text-black font-semibold uppercase">
                Inventory
              </h2>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="bg-black text-white text-[11px] font-bold px-8 py-4.5 uppercase tracking-widest hover:bg-neutral-800 transition-colors active:scale-95 cursor-pointer"
            >
              Add New Product
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-[#cfc4c5] pb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white border border-[#cfc4c5] px-4 py-2">
                <span className="text-[10px] text-neutral-400 font-bold mr-3 uppercase tracking-wider">
                  Category:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setActivePage(1);
                  }}
                  className="border-none p-0 text-[10px] font-bold focus:ring-0 bg-transparent uppercase cursor-pointer"
                >
                  <option>All Collections</option>
                  {backendCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center bg-white border border-[#cfc4c5] px-4 py-2">
                <span className="text-[10px] text-neutral-400 font-bold mr-3 uppercase tracking-wider">
                  Status:
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setActivePage(1);
                  }}
                  className="border-none p-0 text-[10px] font-bold focus:ring-0 bg-transparent uppercase cursor-pointer"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold uppercase underline decoration-[#cfc4c5] underline-offset-4 hover:text-black transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Showing {totalElements} items
            </div>
          </div>

          {/* Product Table Layout */}
          <div className="bg-white border border-[#cfc4c5] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#cfc4c5] bg-[#f5f3f3]">
                  <th className="px-6 py-4 font-semibold text-[10px] text-neutral-400 uppercase tracking-widest w-16 text-center select-none">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        filteredDisplayProducts.length > 0 &&
                        selectedProductIds.size ===
                          filteredDisplayProducts.length
                      }
                      className="w-4 h-4 border-[#cfc4c5] text-black focus:ring-black rounded-none cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold text-[10px] text-neutral-400 uppercase tracking-widest">
                    Product Details
                  </th>
                  <th className="px-6 py-4 font-semibold text-[10px] text-neutral-400 uppercase tracking-widest">
                    Category
                  </th>
                  <th className="px-6 py-4 font-semibold text-[10px] text-neutral-400 uppercase tracking-widest">
                    Price
                  </th>
                  <th className="px-6 py-4 font-semibold text-[10px] text-neutral-400 uppercase tracking-widest text-center">
                    Stock
                  </th>
                  <th className="px-6 py-4 font-semibold text-[10px] text-neutral-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-[10px] text-neutral-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfc4c5]/30">
                {isProductsLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-20">
                      <svg
                        className="animate-spin h-8 w-8 text-black mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <p className="text-neutral-500 font-light text-sm">
                        Đang tải danh sách sản phẩm...
                      </p>
                    </td>
                  </tr>
                ) : filteredDisplayProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-20 text-neutral-500 font-light"
                    >
                      Không tìm thấy sản phẩm nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredDisplayProducts.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      isSelected={selectedProductIds.has(product.id)}
                      onSelect={handleSelectProduct}
                      onOpenColors={setSelectedProductForColors}
                      onOpenEdit={handleOpenEditProduct}
                      onDelete={handleDelete}
                      formatPrice={formatPrice}
                    />
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-6 border-t border-[#cfc4c5] flex items-center justify-between bg-[#fbf9f9] select-none">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Page {activePage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
                  disabled={activePage === 1}
                  className="w-10 h-10 border border-[#cfc4c5] flex items-center justify-center hover:bg-[#efeded] hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-sm">
                    chevron_left
                  </span>
                </button>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  const isActive = activePage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setActivePage(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center text-[10px] font-bold transition-all ${
                        isActive
                          ? "bg-black text-white"
                          : "border border-[#cfc4c5] hover:bg-[#efeded] hover:text-black"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setActivePage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={activePage === totalPages}
                  className="w-10 h-10 border border-[#cfc4c5] flex items-center justify-center hover:bg-[#efeded] hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-sm">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Meta */}
          <footer className="mt-12 text-center select-none opacity-50">
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.25em]">
              © 2026 Lumière Couture • Internal Store Management Platform
            </p>
          </footer>
        </div>
      </main>

      {/* Manage Colors & Images Modal */}
      {selectedProductForColors && (
        <ManageColorsModal
          product={selectedProductForColors}
          onClose={() => setSelectedProductForColors(null)}
        />
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-[#cfc4c5] w-full max-w-lg p-10 relative shadow-xl text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors material-symbols-outlined cursor-pointer select-none"
            >
              close
            </button>
            <h3 className="font-serif text-2xl font-semibold text-black uppercase tracking-wider mb-8 select-none">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            {validationError && (
              <div className="mb-6 p-4 bg-[#ffdad6] text-[#93000a] text-xs font-bold uppercase tracking-wider border border-[#ffdad6]">
                {validationError}
              </div>
            )}

            <form onSubmit={handleCreateOrUpdateSubmit} className="space-y-6">
              {/* Product Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={handleNameChange}
                  required
                  placeholder="e.g. Silk Evening Blazer"
                  className="bg-[#f5f3f3] border-none focus:ring-1 focus:ring-black text-sm px-4 py-3 rounded-none"
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Slug
                </label>
                <input
                  type="text"
                  value={newProduct.slug}
                  onChange={(e) =>
                    setNewProduct((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  required
                  placeholder="e.g. silk-evening-blazer"
                  className="bg-[#f5f3f3] border-none focus:ring-1 focus:ring-black text-sm px-4 py-3 rounded-none"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  required
                  className="bg-[#f5f3f3] border-none focus:ring-1 focus:ring-black text-sm px-4 py-3 cursor-pointer uppercase text-xs font-bold rounded-none"
                >
                  <option value="">Select Category</option>
                  {backendCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the product..."
                  rows="3"
                  className="bg-[#f5f3f3] border-none focus:ring-1 focus:ring-black text-sm px-4 py-3 resize-none rounded-none"
                />
              </div>

              {/* Thumbnail Image Selector */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Thumbnail Image {editingProduct && "(Leave empty to keep existing)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required={!editingProduct}
                  className="text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer rounded-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-[#cfc4c5] hover:bg-[#efeded] text-[10px] font-bold uppercase tracking-wider px-6 py-3 cursor-pointer select-none rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createProductMutation.isPending ||
                    updateProductMutation.isPending
                  }
                  className="bg-black hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider px-6 py-3 cursor-pointer disabled:opacity-50 select-none rounded-none"
                >
                  {createProductMutation.isPending ||
                  updateProductMutation.isPending
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
