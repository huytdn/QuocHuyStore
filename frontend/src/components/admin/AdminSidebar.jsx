import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const AdminSidebar = ({ activeTab = "products" }) => {
  const navigate = useNavigate();
  const logoutStore = useAuthStore((state) => state.logout);
  const adminUser = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logoutStore();
    navigate("/login");
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "#" },
    { key: "products", label: "Products", icon: "inventory_2", href: "/admin/products" },
    { key: "categories", label: "Categories", icon: "category", href: "/admin/categories" },
    { key: "orders", label: "Orders", icon: "shopping_bag", href: "#" },
    { key: "customers", label: "Customers", icon: "group", href: "#" },
    { key: "analytics", label: "Analytics", icon: "analytics", href: "#" },
  ];

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen bg-[#fbf9f9] border-r border-[#cfc4c5] flex flex-col py-8 z-50">
      <div className="px-6 mb-10">
        <h1 className="font-serif text-2xl font-semibold tracking-widest uppercase text-black">
          LUMIÈRE
        </h1>
        <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
          Admin Console
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Link
              key={item.key}
              to={item.href}
              className={`flex items-center px-6 py-4 transition-colors duration-200 ${
                isActive
                  ? "text-black font-bold border-r-2 border-black bg-[#efeded]"
                  : "text-neutral-500 hover:text-black hover:bg-[#efeded]"
              }`}
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              <span className="text-xs font-bold tracking-widest uppercase">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-[#cfc4c5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 select-none">
              {adminUser?.displayName
                ? adminUser.displayName.charAt(0).toUpperCase()
                : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate max-w-[120px]">
                {adminUser?.displayName || "Julian S."}
              </p>
              <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">
                Store Manager
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="material-symbols-outlined text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
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
