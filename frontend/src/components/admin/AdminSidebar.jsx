import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { useLogout } from "../../hooks/api/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminConversations, initStompClient } from "../../hooks/api/useChat";

const AdminSidebar = ({ activeTab = "products" }) => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const adminUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logoutMutation.mutate(null, {
      onSettled: () => {
        navigate("/admin/login");
      },
    });
  };

  const adminTotalUnreadCount = useChatStore((state) => state.adminTotalUnreadCount);
  const setAdminTotalUnreadCount = useChatStore((state) => state.setAdminTotalUnreadCount);

  const { data: convPage } = useAdminConversations({ page: 0, size: 50 }, !!adminUser);

  useEffect(() => {
    if (convPage?.content) {
      const totalUnread = convPage.content.reduce(
        (sum, conv) => sum + (conv.unreadCount || 0),
        0
      );
      setAdminTotalUnreadCount(totalUnread);
    }
  }, [convPage, setAdminTotalUnreadCount]);

  // Realtime STOMP listener for Admin Sidebar Badge
  useEffect(() => {
    if (!adminUser) return;

    const client = initStompClient({
      onConnect: (stomp) => {
        stomp.subscribe("/topic/admin/conversations", () => {
          queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
        });
      },
    });

    return () => {
      if (client) client.deactivate();
    };
  }, [adminUser, queryClient]);

  const navItems = [
    { key: "dashboard", label: "Tổng quan & Thống kê", icon: "dashboard", href: "/admin/dashboard" },
    { key: "products", label: "Sản phẩm", icon: "inventory_2", href: "/admin/products" },
    { key: "categories", label: "Danh mục", icon: "category", href: "/admin/categories" },
    { key: "vouchers", label: "Mã giảm giá", icon: "confirmation_number", href: "/admin/vouchers" },
    { key: "orders", label: "Đơn hàng", icon: "shopping_bag", href: "/admin/orders" },
    { key: "reviews", label: "Đánh giá", icon: "rate_review", href: "/admin/reviews" },
    { key: "customers", label: "Khách hàng", icon: "group", href: "/admin/customers" },
    { key: "messages", label: "Tin nhắn", icon: "forum", href: "/admin/messages" },
  ];

  return (
    <aside className="w-56 fixed left-0 top-0 h-screen bg-[#fbf9f9] border-r border-[#cfc4c5] flex flex-col py-6 z-50">
      <div className="px-5 mb-6">
        <h1 className="font-serif text-xl font-semibold tracking-widest uppercase text-black">
          LUMIÈRE
        </h1>
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
          Quản trị hệ thống
        </p>
      </div>

      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          const showMessagesBadge = item.key === "messages" && adminTotalUnreadCount > 0;

          return (
            <Link
              key={item.key}
              to={item.href}
              className={`flex items-center justify-between px-5 py-2.5 transition-colors duration-200 ${
                isActive
                  ? "text-black font-bold border-r-2 border-black bg-[#efeded]"
                  : "text-neutral-500 hover:text-black hover:bg-[#efeded]"
              }`}
            >
              <div className="flex items-center">
                <span className="material-symbols-outlined text-lg mr-2.5">{item.icon}</span>
                <span className="text-[11px] font-bold tracking-wider uppercase">
                  {item.label}
                </span>
              </div>

              {showMessagesBadge && (
                <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full font-mono animate-bounce shadow-xs">
                  {adminTotalUnreadCount > 99 ? "99+" : adminTotalUnreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[#cfc4c5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2.5 select-none">
              {adminUser?.displayName
                ? adminUser.displayName.charAt(0).toUpperCase()
                : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate max-w-[100px]">
                {adminUser?.displayName || "Julian S."}
              </p>
              <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">
                Quản trị viên
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="material-symbols-outlined text-neutral-400 hover:text-red-600 transition-colors cursor-pointer text-lg"
            title="Đăng xuất"
          >
            logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
