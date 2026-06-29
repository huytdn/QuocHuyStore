import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import axiosClient from "./api/axiosClient";
import Header from "./components/Header";
import Collection from "./pages/Collection";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white select-none">
        <svg
          className="animate-spin h-10 w-10 text-white mb-4"
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
        <span className="text-sm font-semibold tracking-wider text-zinc-400">
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
        <Route path="/collection" element={<Collection />} />
        {/* <Route path="/collection/:category" element={<CategoriesCollection />} /> */}

        {/* protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800 font-bold">
                Dashboard (Protected Area)
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
