import { useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../hooks/api/useCategories";

const AdminCategories = () => {
  const [activePage, setActivePage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null if adding, category object if editing
  const [categoryName, setCategoryName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // API Integration
  const { data: catPage, isLoading } = useCategories({
    page: activePage - 1,
    size: 10,
  });

  const categories = catPage?.content || [];
  const totalElements = catPage ? catPage.totalElements : 0;
  const totalPages = catPage ? catPage.totalPages : 1;

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!categoryName.trim()) {
      setErrorMessage("Vui lòng nhập tên danh mục!");
      toast.warn("Vui lòng nhập tên danh mục!");
      return;
    }

    if (editingCategory) {
      // Update
      updateCategoryMutation.mutate(
        { id: editingCategory.id, name: categoryName.trim() },
        {
          onSuccess: () => {
            toast.success("Cập nhật danh mục thành công!");
            setIsModalOpen(false);
            setCategoryName("");
            setEditingCategory(null);
          },
          onError: (err) => {
            const msg = err.response?.data?.message || "Cập nhật danh mục thất bại!";
            setErrorMessage(msg);
            toast.error(msg);
          },
        }
      );
    } else {
      // Create
      createCategoryMutation.mutate(
        { name: categoryName.trim() },
        {
          onSuccess: () => {
            toast.success("Thêm danh mục mới thành công!");
            setIsModalOpen(false);
            setCategoryName("");
          },
          onError: (err) => {
            const msg = err.response?.data?.message || "Thêm danh mục thất bại!";
            setErrorMessage(msg);
            toast.error(msg);
          },
        }
      );
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) {
      deleteCategoryMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Xóa danh mục thành công!");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Xóa danh mục thất bại!");
        },
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-[#fbf9f9] text-[#1b1c1c] font-sans antialiased min-h-screen flex text-left">
      {/* Side Navigation Component */}
      <AdminSidebar activeTab="categories" />

      {/* Main Content Area */}
      <main className="ml-56 flex-1 min-h-screen flex flex-col">
        {/* Top Navigation Component */}
        <AdminHeader />

        {/* Page Content */}
        <div className="p-8 md:p-10 flex-grow">
          {/* Page Header Actions */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <nav className="flex mb-2 space-x-2 text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                <span>Catalogue</span>
                <span>/</span>
                <span className="text-black">Categories</span>
              </nav>
              <h2 className="font-serif text-[30px] md:text-[34px] leading-tight text-black font-semibold uppercase">
                Categories
              </h2>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="bg-black text-white text-[10px] font-bold px-5 py-2.5 uppercase tracking-widest hover:bg-neutral-800 transition-colors active:scale-95 cursor-pointer"
            >
              Add New Category
            </button>
          </div>

          {/* Filter / Meta Bar */}
          <div className="flex items-center justify-between mb-5 border-b border-[#cfc4c5] pb-4">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Categories: {totalElements}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#cfc4c5] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#cfc4c5] bg-[#f5f3f3]">
                  <th className="px-4 py-2.5 font-semibold text-[9px] text-neutral-400 uppercase tracking-widest w-16 text-center select-none">
                    #ID
                  </th>
                  <th className="px-4 py-2.5 font-semibold text-[9px] text-neutral-400 uppercase tracking-widest">
                    Category Name
                  </th>
                  <th className="px-4 py-2.5 font-semibold text-[9px] text-neutral-400 uppercase tracking-widest">
                    Created At
                  </th>
                  <th className="px-4 py-2.5 font-semibold text-[9px] text-neutral-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfc4c5]/30">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-16">
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
                        Đang tải danh sách danh mục...
                      </p>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-16 text-neutral-500 font-light"
                    >
                      Chưa có danh mục nào trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-[#f5f3f3] transition-colors group"
                    >
                      <td className="px-4 py-3 text-center select-none font-bold text-xs text-neutral-400">
                        #{cat.id}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-xs text-black">
                          {cat.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {formatDate(cat.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right select-none">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="material-symbols-outlined text-neutral-400 hover:text-black mr-2 transition-colors cursor-pointer text-base"
                          title="Sửa danh mục"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="material-symbols-outlined text-neutral-400 hover:text-red-600 transition-colors cursor-pointer text-base"
                          title="Xóa danh mục"
                        >
                          delete
                        </button>
                      </td>
                    </tr>
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
                  className="w-10 h-10 border border-[#cfc4c5] flex items-center justify-center hover:bg-[#efeded] hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
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
                      className={`w-10 h-10 flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
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
                  className="w-10 h-10 border border-[#cfc4c5] flex items-center justify-center hover:bg-[#efeded] hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-[#cfc4c5] w-full max-w-md p-8 relative shadow-xl text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors material-symbols-outlined cursor-pointer select-none"
            >
              close
            </button>
            <h3 className="font-serif text-2xl font-semibold text-black uppercase tracking-wider mb-6 select-none">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>

            {errorMessage && (
              <div className="mb-4 p-3 bg-[#ffdad6] text-[#93000a] text-xs font-bold uppercase border border-[#ffdad6]">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Thời trang Nam, Trang sức"
                  required
                  className="bg-[#f5f3f3] border-none focus:ring-1 focus:ring-black text-sm px-4 py-3 rounded-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-4">
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
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                  className="bg-black hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider px-6 py-3 cursor-pointer disabled:opacity-50 select-none rounded-none"
                >
                  {createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                    ? "Saving..."
                    : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
