import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  login: (user, accessToken) =>
    set({ user, accessToken }),
  logout: () => set({ user: null, accessToken: null }),
  updateUser: (updatedUser) =>
    set((state) => ({ user: state.user ? { ...state.user, ...updatedUser } : null })),
}));
