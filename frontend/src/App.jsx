import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import axiosClient from "./api/axiosClient";
import Header from "./components/Header";
import Product from "./pages/Product";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import SmartSearch from "./pages/SmartSearch";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import About from "./pages/About";

// Global promise to coalesce concurrent silent refresh calls on startup (e.g. React StrictMode)
let silentRefreshPromise = null;

const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const runRefresh = async () => {
      const state = useAuthStore.getState();

      if (!silentRefreshPromise) {
        silentRefreshPromise = axiosClient
          .post("/auth/refresh", {})
          .then((res) => res.data)
          .finally(() => {
            silentRefreshPromise = null;
          });
      }

      try {
        const data = await silentRefreshPromise;
        state.login(data.user, data.accessToken);
      } catch {
        state.logout();
      } finally {
        setIsInitializing(false);
      }
    };

    runRefresh();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbf9f9] text-black select-none">
        <svg
          className="animate-spin h-10 w-10 text-black mb-4"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm font-semibold tracking-wider text-neutral-500">
          Đang tải ứng dụng...
        </span>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/smart-search" element={<SmartSearch />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        {/* <Route path="/collection/:category" element={<CategoriesCollection />} /> */}
      </Routes>
    </>
  );
};

export default App;
