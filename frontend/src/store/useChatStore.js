import { create } from "zustand";

export const useChatStore = create((set) => ({
  userUnreadCount: 0,
  adminTotalUnreadCount: 0,

  setUserUnreadCount: (count) =>
    set({ userUnreadCount: Math.max(0, count) }),

  setAdminTotalUnreadCount: (count) =>
    set({ adminTotalUnreadCount: Math.max(0, count) }),

  incrementUserUnread: () =>
    set((state) => ({ userUnreadCount: state.userUnreadCount + 1 })),

  resetUserUnread: () =>
    set({ userUnreadCount: 0 }),
}));
