import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send HttpOnly cookies with all API requests
});

// Request interceptor: Attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle expired tokens
const authChannel =
  typeof window !== "undefined" && window.BroadcastChannel
    ? new BroadcastChannel("auth_channel")
    : null;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Listen to auth events from other browser tabs
if (authChannel) {
  authChannel.onmessage = (event) => {
    const { type, accessToken, user } = event.data;

    if (type === "REFRESH_START") {
      isRefreshing = true;
    } else if (type === "REFRESH_SUCCESS") {
      isRefreshing = false;
      useAuthStore.getState().login(user, accessToken);
      processQueue(null, accessToken);
    } else if (type === "REFRESH_FAILURE") {
      isRefreshing = false;
      processQueue(new Error("Refresh failed in another tab"), null);
      useAuthStore.getState().logout();
    }
  };
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop & check if it's 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url === "/auth/refresh" ||
        originalRequest.url === "/auth/login"
      ) {
        // If the refresh token request itself fails, clear auth state
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Broadcast start event to other tabs
      if (authChannel) {
        authChannel.postMessage({ type: "REFRESH_START" });
      }

      const user = useAuthStore.getState().user;
      if (!user) {
        if (authChannel) {
          authChannel.postMessage({ type: "REFRESH_FAILURE" });
        }
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint (using standard axios withCredentials)
        const refreshResponse = await axios.post(
          "http://localhost:8080/api/v1/auth/refresh",
          {},
          { withCredentials: true },
        );

        const { accessToken, user: updatedUser } = refreshResponse.data;

        // Save new accessToken in-memory and update user info
        useAuthStore.getState().login(updatedUser, accessToken);

        // Broadcast success to other tabs
        if (authChannel) {
          authChannel.postMessage({
            type: "REFRESH_SUCCESS",
            accessToken,
            user: updatedUser,
          });
        }

        // Process queue
        processQueue(null, accessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Broadcast failure to other tabs
        if (authChannel) {
          authChannel.postMessage({ type: "REFRESH_FAILURE" });
        }
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
